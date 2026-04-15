# Chump Chicken Chase
Chase a chaotic orange chicken around to save the town.

*(Project codename: Trumplestiltskin.)*

**Play it:** open `index.html` via any static server, or [play it on GitHub Pages](https://tamryn72.github.io/trumplestiltskin/).

---

## Full Game Design

### Core Concept
A pixel-art browser game (HTML Canvas) with 5 worlds. Each level has a **PLAN phase** (place traps, set barriers) then a **CHASE phase** (real-time pursuit). The chicken is an unhinged orange menace who destroys everything, rage-baits you, cheats constantly, and always escapes until the final volcano level where you punt him into the crater.

---

### THE CHICKEN — Personality & Behaviors

**Signature catchphrases** (random rotation):
- "Quiet, piggy" (his go-to taunt when you get close)
- "no eggs for you, loser"
- "I am the Golden Goose!"
- "No one runs faster than me!"
- "I am the best, the absolute best"
- "imagine losing to a chicken 💀"
- "THIS [location] MINE NOW"
- "I am the best at escape, the very best, no one escapes like I do!" (when he escapes a trap)

**Core behaviors (all worlds):**
- Leaves an **orange goo trail** everywhere — splats on buildings, roads, grass
- Drops **feathers** as particles when running
- **Throws eggs at the player** with tiny pixel chicken hands — stuns player briefly on hit, eggs arc in a projectile path
- If a **cat/kitten** spawns on the map, he chases it, grabs it, and **tosses it in the air** (cat lands safely with a dizzy animation) — this is exploitable as a distraction
- Gets **distracted by pretty hens** 🐓 — hens can be placed as a trap type, chicken stops to strut and flirt for several seconds
- **Eats McDonald's burgers** 🍔 — burgers spawn randomly on the map. If chicken reaches one, he gets a speed/strength buff for a short time (glows red, moves faster, destroys things in one hit). Player can also pick up burgers to use as trap bait.
- **Sets fires** 🔥 — fire spreads to adjacent flammable tiles over time
- **Destroys protectable buildings** — kicks, pecks, body-slams them
- **Cheats escalate per world** — dodge (double-move), teleport, swimming, minions, cloning a decoy

**Rage meter** (0-100%): Builds over time and when caught in traps. At high rage he moves faster, destroys more aggressively, taunts more, head enlarges. hair piece flops aggressively, and glows red. At 100% he enters "FINAL FORM" temporarily — faster, immune to basic traps.

---

### THE PLAYER

- Pixel sprite farmer character
- Moves on grid, WASD/arrows
- Can place traps during PLAN phase and also mid-chase (limited supply)
- Gets briefly stunned if hit by thrown egg (0.5s freeze + screen shake)
- Can pick up burgers before the chicken does (removes them from map, adds to trap inventory as "Burger Bait")
- Walks through goo (slowed slightly)

---

### TRAP TYPES (unlock progressively)

1. **Net Trap** 🪤 — Basic, stuns 3 ticks. Available World 1+
2. **Banana Peel** 🍌 — Slip & stun 2 ticks, chicken slides forward one tile. World 1+
3. **Drop Cage** 🗑️ — Heavy stun 4 ticks. World 1+
4. **Glue Pad** 🟫 — Super sticky, stun 5 ticks. World 2+
5. **Corn Decoy** 🌽 — Lures chicken toward it. World 2+
6. **Pretty Hen** 🐓 — Chicken stops to flirt for 6+ ticks, struts around her. World 3+
7. **Burger Bait** 🍔 — Irresistible lure, chicken runs straight for it. When he eats it, it's actually a trap — stun 4 ticks + "THAT WASN'T A BIG MAC!" speech bubble. World 3+
8. **Cat Decoy** 🐱 — Places a kitten. Chicken MUST chase it (overrides AI). While distracted tossing the cat, he's vulnerable. World 4+

---

### WORLD DESIGN — 5 Worlds

**World 1: THE FARM** 🌾
- Setting: Barn, fences, hay bales, chicken coop, pond, tractor, scarecrow
- Protectables: Barn (3hp), Silo (2hp), Feed Cart (1hp), Hay Bales (1hp each), Chicken Coop (2hp), Scarecrow (1hp)
- Chicken behavior: Kicks over feed buckets, sets barn on fire, rolls hay bales at player, does victory dance on tractor
- Special: Chickens from the coop scatter when he passes (cosmetic chaos)
- Cheats: Dodge only
- Traps available: Net, Banana, Cage (3 total)
- Catches needed: 2
- Escape cutscene: Squeezes through fence, does a backflip, moonwalks into sunset, dabs

**World 2: THE MARKET** 🏪
- Setting: Fruit stands, fish cart, bakery, flower shop, fountain, clock tower, restaurant, cobblestone streets
- Protectables: Fruit Stand (1hp), Fish Cart (1hp), Bakery (2hp), Flower Shop (1hp), Restaurant (2hp), Fountain (3hp), Clock Tower (3hp), Apple Cart (1hp)
- Chicken behavior: Flips EVERY cart (animation), splatters orange goo on windows, throws fish at pedestrians (cosmetic NPCs), jaywalks while staring at you
- Special: Overturned carts become obstacles on the map
- Cheats: Dodge + Teleport
- Traps available: +Glue, Corn Decoy (5 total)
- Catches needed: 2
- Escape cutscene: Knocks over fruit stand, creates orange tidal wave, surfs it yelling "COWABUNGA"

**World 3: THE DOCKS** ⚓
- Setting: Warehouses, fishing boats, lighthouse, cargo crates, crane, pier, nets
- Protectables: Warehouse (3hp), Fish Market (1hp), Lighthouse (3hp), Cargo (1hp), Boats (2hp each), Crane (2hp), Net Stack (1hp)
- Chicken behavior: Unties boats (they drift off-screen), dumps cargo overboard, cannonballs off pier splashing nearby tiles, rides barrel like jet ski, sets nets on fire
- Special: Water tiles — chicken can swim here (cheat), player cannot. Barrels float as temporary platforms.
- Cheats: Dodge + Teleport + Swim
- Traps available: +Pretty Hen, Burger Bait (5 total)
- Catches needed: 3
- Escape cutscene: Hijacks speedboat, puts on tiny sunglasses, does donuts in harbor, waves with one wing

**World 4: CASTLE TOWN** 🏰
- Setting: Castle walls, throne room, armory, kitchen, village houses below, catapult, drawbridge, moat
- Protectables: Throne (3hp), Crown Room (3hp), Armory (2hp), Kitchen (1hp), Village Houses (1hp each), Catapult (2hp), Inn (2hp)
- Chicken behavior: Wears crown (sprite change), knights pigeons, catapults pumpkins at village, releases drawbridge on people, declares himself king
- Special: Castle walls are maze-like, must go through gate. Catapult can be used BY player if still intact (launches net projectile across map)
- Cheats: Dodge + Teleport + Clone decoy
- Traps available: +Cat Decoy (6 total)
- Catches needed: 3
- Escape cutscene: Launches from catapult over wall, lands in hay cart, rides it downhill screaming "FREEDOM!"

**World 5: THE VOLCANO** 🌋
- Setting: Volcanic mountain, lava streams, crumbling rock paths, ancient shrine, rope bridges, crater at top
- Protectables: Bridges (2hp), Boulder barriers (1hp), Shrine (2hp), Ancient Ruin (2hp)
- Chicken behavior: FULL CHAOS — dodges lava, throws FLAMING eggs, sets everything on fire, screams "WITNESS ME," rock-slides triggered when he passes certain tiles
- Special: Lava tiles damage player if adjacent too long. Rocks fall randomly creating/blocking paths. The crater at the top is the goal — corner him there.
- Cheats: ALL cheats active — Dodge, Teleport, Swim (through lava!!), Clone
- Traps available: ALL types (7 total)
- Catches needed: 3 (final catch triggers the ending)
- **NO ESCAPE** — Final catch = cutscene of punting him into volcano crater

---

### VICTORY SEQUENCE

When you land the final catch on World 5:
1. Screen shake + flash
2. Cutscene: Chicken at crater edge, tries triple backflip dodge, MISSES, falls into lava
3. Volcano erupts — screen fills with particles (fire, confetti, fireworks)
4. His voice echoes from the lava: "GG... well played... 🐔🔥"
5. Scene change: The whole town celebrating — pixel art parade, confetti rain, mayor hands you key to city
6. Final score screen with stats: buildings saved, traps used, eggs dodged, cats tossed, burgers eaten
7. "PLAY AGAIN" button

---

### TECHNICAL NOTES FOR CLAUDE CODE

- **Single HTML file**, all Canvas-rendered (no DOM game elements)
- **Pixel art sprites** drawn programmatically (sprite data arrays with palettes, rendered to offscreen canvases, cached)
- **Grid-based** movement for both player and chicken
- **Game loop**: requestAnimationFrame, delta-time accumulator for chicken movement speed
- **Two-phase per level**: Plan (place traps, click tiles) → Chase (real-time movement)
- **Particle system**: emoji-based particles for explosions, feathers, goo splats, fire, eggs
- **Speech bubble system**: white rounded rects with text, float up and fade
- **Screen shake**: offset canvas translation on impacts
- **Projectile system** for egg throwing: arc trajectory from chicken toward player, collision detection
- **Spawn system**: burgers and cats appear randomly during chase phase on valid tiles
- **Mobile**: touch d-pad overlay bottom-right, tap-to-place traps
- **Sound**: optional — Web Audio API beeps/boops for retro feel, or skip entirely

---

That's the whole thing. Hand this to Claude Code and let it rip. 🐔🔥
