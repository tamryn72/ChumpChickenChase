// tools/build.mjs — concat src/ into a single dist/index.html.
//
// This is a tiny, dependency-free bundler tailored to the specific ESM
// patterns this codebase uses. It walks src/, rewrites imports to lookups
// into a __mods registry, wraps each module in a function, topologically
// orders them, and inlines the bundle into a copy of index.html.
//
// Run with:
//   node tools/build.mjs
// Produces:
//   dist/index.html   — single double-clickable file, no relative imports
//
// Limitations (intentional):
//   - no tree shaking, no minification
//   - assumes modules use: `import { ... } from './path.js'`
//     or `import * as x from './path.js'`, with optional `as` renames
//   - assumes exports are `export function|const|class NAME` or
//     `export { A, B as C }`
//   - assumes no top-level side effects that depend on import order within
//     a single file beyond what the import statements already imply

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const INDEX = path.join(ROOT, 'index.html');
const DIST = path.join(ROOT, 'dist');
const OUT  = path.join(DIST, 'index.html');
const ENTRY_REL = 'main.js'; // relative to src/

// --- file walk ---------------------------------------------------------------

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.js')) out.push(p);
  }
  return out;
}

function toKey(absPath) {
  // canonical module key: path relative to src/, forward slashes, .js kept
  return path.relative(SRC, absPath).split(path.sep).join('/');
}

function resolveImport(fromKey, spec) {
  // spec starts with './' or '../'
  const base = path.posix.dirname(fromKey);
  const joined = path.posix.normalize(path.posix.join(base, spec));
  return joined;
}

// --- parse imports -----------------------------------------------------------

// Returns { deps: [key...], bodyWithoutImports: string, importLines: [rewritten line...] }
function parseImports(key, src) {
  // Match import statements (possibly multiline with { ... } spanning newlines)
  const importRe = /import\s+(?:(\*\s+as\s+\w+)|(\{[\s\S]*?\}))\s+from\s+['"]([^'"]+)['"]\s*;?/g;
  const deps = new Set();
  const importLines = [];
  let body = src.replace(importRe, (full, starAs, braces, spec) => {
    const depKey = resolveImport(key, spec);
    deps.add(depKey);
    if (starAs) {
      // `* as name`
      const m = starAs.match(/\*\s+as\s+(\w+)/);
      const name = m[1];
      importLines.push(`const ${name} = __get('${depKey}');`);
    } else {
      // `{ a, b as c }` — convert to destructuring with rename
      const inner = braces.slice(1, -1).trim();
      if (inner.length === 0) {
        importLines.push(`/* empty import from ${depKey} */`);
      } else {
        const parts = inner.split(',').map((s) => s.trim()).filter(Boolean);
        // Build `const { a, b: c } = __get('path');`
        const destructs = parts.map((part) => {
          const m = part.match(/^(\w+)(?:\s+as\s+(\w+))?$/);
          if (!m) return part; // bail
          const [, orig, renamed] = m;
          return renamed ? `${orig}: ${renamed}` : orig;
        });
        importLines.push(`const { ${destructs.join(', ')} } = __get('${depKey}');`);
      }
    }
    return ''; // strip the original import line
  });
  return { deps: [...deps], body, importLines };
}

// --- rewrite exports ---------------------------------------------------------

// Replaces `export function foo`, `export const bar`, `export class Baz`
// with their unprefixed form AND appends `__exports.NAME = NAME;` at the end.
// Handles grouped `export { a, b as c };`.
function rewriteExports(body) {
  const exportNames = new Set();
  const exportAliases = []; // [{ name: localName, as: exportedName }]

  // export function|const|class NAME
  body = body.replace(/^export\s+(function|const|class|let|var)\s+(\w+)/gm, (_, kw, name) => {
    exportNames.add(name);
    return `${kw} ${name}`;
  });

  // export { A, B as C };
  body = body.replace(/^export\s*\{([\s\S]*?)\}\s*;?/gm, (_, inner) => {
    const parts = inner.split(',').map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const m = part.match(/^(\w+)(?:\s+as\s+(\w+))?$/);
      if (!m) continue;
      const [, local, exported] = m;
      exportAliases.push({ name: local, as: exported || local });
    }
    return ''; // drop the original line
  });

  // Emit trailer assignments
  const trailer = [];
  for (const n of exportNames) trailer.push(`__exports.${n} = ${n};`);
  for (const { name, as } of exportAliases) trailer.push(`__exports.${as} = ${name};`);

  return { body, trailer: trailer.join('\n') };
}

// --- topological sort --------------------------------------------------------

function topo(nodes, entry) {
  const visited = new Set();
  const order = [];
  function visit(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const n = nodes.get(key);
    if (!n) throw new Error('missing module: ' + key);
    for (const d of n.deps) visit(d);
    order.push(key);
  }
  visit(entry);
  return order;
}

// --- main --------------------------------------------------------------------

function main() {
  console.log('build: walking src/');
  const files = walk(SRC);
  const nodes = new Map();

  for (const abs of files) {
    const key = toKey(abs);
    const src = fs.readFileSync(abs, 'utf8');
    const parsed = parseImports(key, src);
    const { body, trailer } = rewriteExports(parsed.body);
    nodes.set(key, {
      key,
      deps: parsed.deps,
      importLines: parsed.importLines,
      body,
      trailer,
    });
  }

  console.log(`build: ${nodes.size} modules, entry=${ENTRY_REL}`);
  const order = topo(nodes, ENTRY_REL);

  // Emit bundle
  const parts = [];
  parts.push(`// chump chicken chase — bundled ${new Date().toISOString()}`);
  parts.push('(function () {');
  parts.push('const __mods = Object.create(null);');
  parts.push("function __get(k) { return __mods[k]; }");
  for (const key of order) {
    const n = nodes.get(key);
    parts.push(`// ---- ${key} ----`);
    parts.push(`__mods['${key}'] = (function () {`);
    parts.push('const __exports = {};');
    for (const line of n.importLines) parts.push(line);
    parts.push(n.body);
    if (n.trailer) parts.push(n.trailer);
    parts.push('return __exports;');
    parts.push('})();');
  }
  parts.push('})();');
  const bundle = parts.join('\n');

  // Inline into index.html
  const html = fs.readFileSync(INDEX, 'utf8');
  const scriptTagRe = /<script\s+type="module"\s+src="\.\/src\/main\.js"\s*><\/script>/;
  if (!scriptTagRe.test(html)) {
    throw new Error('index.html script tag not found in expected shape');
  }
  const inline = `<script>\n${bundle}\n</script>`;
  const outHtml = html.replace(scriptTagRe, inline);

  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(OUT, outHtml, 'utf8');
  const kb = (outHtml.length / 1024).toFixed(1);
  console.log(`build: wrote ${path.relative(ROOT, OUT)} (${kb} KB)`);
}

main();
