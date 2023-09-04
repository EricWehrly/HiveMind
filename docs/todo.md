- why are chunks not generating in the negative (left and top)?

- it's time to refactor chunks to only generate for players
    - event context?

- We need to draw lines at chunk borders to better visualize
    Use biome colors for now (tint?)

- enemies should also attack player entities (spawns, and buildings)

- default player should be faster than default enemies
it should also be very difficult for enemies to kite players (may as well make that impossible for this iteration)

- I think we need to have min and max aggression (and other things that get random)
in part to be able to determine what % of max aggression a creature is
(which will help us "paint it redder" to visually indicate)

- add more technologies that enemies can have:
    poison, projectiles, thorns, shell (protective)
    bark - summons friends (useless to player, as they are a hive mind)
        (this might be a fun one for later -- options of befriending fauna, and would be better telegraphed when enmies have appearance)

- Maybe learning new technologies should work like:
    - the more you already know, the more pieces (of a new one) that you need to collect in order to research
    - but the more you know, the shorter it is to research?

- The more evolved an attack is, the longer it takes the player to switch to it.
Should be able to switch to a new attack even if switch in progress is not complete
- - Needs multiple attacks (we have slap, a ranged one would be interesting, but maybe a bite or claw first - - except I think claw was supposed to be upgraded slap)
- - Also needs implemented ability to switch between them...

- buildings for: doing research, defending, healing
defense can later break out to either turrets or unit spawners

- (Visual) feedback for unlocks

- would be nice to make a UI (options?) that shows which keys are bound

- create a ui element showing player size
    within debug menu

- Camera controls & following player
    rendering controller or something for other entities
    smooth movement? tweening? speed and accel?
    when player faces a direction, the camera should "shift" in that direction, such that the player is off-center on the screen, with the 'peeked' direction taking some amount

- need one 'interact' action that changes context, or some similar inhibition to 'F' overloading

- need to have some collision

- need to finish implementing biomes

- maybe some terrain variety? Mountains, valleys, water
trees, rocks

- And with that, animals that can swim, amphibians, and the player needing to learn to swim in order to traverse that "biome"

- time to try networking with webrtc signal and turn ... can probably just stand up a docker on localhost for now

---

- Maybe the javascript-extensions mergeDeep could check for properties that have a getter but not a setter,
    and skip those?
    Tried this. It's hard. The getOwnProperty doesn't show the get or set for some reason

Make it so that spawned slimes can lose line of sight
In which case they will return to where they spawned from the player, and then wander looking for them.
There's an evolution (radio?) that'll make them behave like the current implementation

And maybe there's another upgrade that let's you make them stronger (more health, speed, yield when gathering) in exchange for being more expensive

---

Two gameplay modes (for testing which is better received):

"Action" -- what we do now

"Contiguous" -- you're a node-based organism and you choose nodes to grow out from your body. Different node types can be connected to other node types. 
Initial nodes would be for consumption (nearby flora) and digestion (converting to usable resources).
Some nodes may be limited by where they can be placed / which nodes they can be attached to, but maybe we can use a bonuses system.

Maybe for the contiguous mode, there's a way to split the gameplay difference by allowing the player to (grow and?) "spit out" (or would one be pre grown with like a timer for how quickly a new one can be ready?) a controllable organism to fight / defend 

---

Tech tree with evolutions for one track incorporating with local fauna
one track just being an all-consuming

There's a node you can build that allows you to (slowly) beam back things you learn from the tech tree to the universal hive mind (persists between runs)
Conversely, you're only allowed to send a finite information to new runs, so the node would also be downloading researched techs from the tree.