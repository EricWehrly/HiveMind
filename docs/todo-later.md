- need one 'interact' action that changes context, or some similar inhibition to 'F' overloading

- We need to draw lines at chunk borders to better visualize
    Use biome colors for now (tint?)

- Enemy techs:
    bark - summons friends (useless to player, as they are a hive mind)
        (this might be a fun one for later -- options of befriending fauna, and would be better telegraphed when enmies have appearance)

- Studying somethin adds it to research menu

- (Visual) feedback for unlocks

- hint system:
    structured hint class
    making new hints allows you to define a display prerequisite, as well as "goals" to complete it
    player/session-level setting to dis/enable hints
    Hints for:
    - Use WADS to move
    - space to attack
    etc.

- would be nice to make a UI (options?) that shows which keys are bound

- some means of configuration...

---

- Maybe the javascript-extensions mergeDeep could check for properties that have a getter but not a setter,
    and skip those?
    Tried this. It's hard. The getOwnProperty doesn't show the get or set for some reason

Make it so that spawned slimes can lose line of sight
In which case they will return to where they spawned from the player, and then wander looking for them.
There's an evolution (radio?) that'll make them behave like the current implementation

it should be very difficult for enemies to kite players (may as well make that impossible for this iteration)

- Difficulties: 
    Easy mode is what we have now
    In medium mode you impact the environment, with fauna learning or adapting based on your abilities
    On hard, planets have dominant sentient species that will react to you and have tactics

---

- After rivers implemented, animals that can swim, amphibians, and the player needing to learn to swim in order to traverse that "biome"

---

Two gameplay modes (for testing which is better received):

"Action" -- what we do now

"Contiguous" -- you're a node-based organism and you choose nodes to grow out from your body. Different node types can be connected to other node types. 
Initial nodes would be for consumption (nearby flora) and digestion (converting to usable resources).
Some nodes may be limited by where they can be placed / which nodes they can be attached to, but maybe we can use a bonuses system.

Maybe for the contiguous mode, there's a way to split the gameplay difference by allowing the player to (grow and?) "spit out" (or would one be pre grown with like a timer for how quickly a new one can be ready?) a controllable organism to fight / defend 
