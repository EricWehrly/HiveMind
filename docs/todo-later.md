- if you hold down space bar for a bit, 
    but don't release it
    draw a 'hitbox' area in front of the player,
    rendering the current range of their attack
    Also, slow down the movement of the player when they do this,
    and shorten the activation time of their attack ability
    (also we'll need to add in 'activation time' :/)
    also this shouldn't be "hard bound" to space, it should be the attack button
    but if we can, it would be nice to rig it up in a way that 
        lets this be bound to a separate button, alternatively, as desired

- incorporate 'rotation' into the renderer
    step 1 is going to be actually assigning it
    starting with when we're turning to face our target ...

- terrain should have a "roughness" that slows down characters moving over it
    this should be able to vary e ven among tile types (adjacent grass tiles with different roughness, etc.)

- debug console command:
    - list of everything currently growing
        need to find out why reservations + food threshold aren't keeping a steady minimum

- debug ui
    show how many characters are and are not thinking right now
    need to be able to show/hide ui sections like the build queue

debug click on character to get more info about them ...
    last thought age (how many seconds ago)
    current task, etc.

It would be nice to have an 
    indicator of the number of 'pieces' intending to return to the player character

- need to finish implementing biomes

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

- time to try networking with webrtc signal and turn ... can probably just stand up a docker on localhost for now

- would be nice to make a UI (options?) that shows which keys are bound

- some means of configuration...

---

Make it so that spawned slimes can lose line of sight
In which case they will return to where they spawned from the player, and then wander looking for them.
There's an evolution (radio?) that'll make them behave like the current implementation

it should be very difficult for enemies to kite players (may as well make that impossible for this iteration)

- Difficulties: 
    Easy mode is what we have now
    In medium mode you impact the environment, with fauna learning or adapting based on your abilities
    On hard, planets have dominant sentient species that will react to you and have tactics

- Planet 'selector'
    Player chooses size and sentience
    size is "normal", "smaller", or "larger"
        this is implied to mean play time and intensity
        smaller planets will play more intensely
        larger planets more ploddingly

- Maybe the javascript-extensions mergeDeep could check for properties that have a getter but not a setter,
    and skip those?
    Tried this. It's hard. The getOwnProperty doesn't show the get or set for some reason
    (We've moved away from using this method)

---

- After rivers implemented, animals that can swim, amphibians, and the player needing to learn to swim in order to traverse that "biome"

---

Two gameplay modes (for testing which is better received):

    "Action" -- what we do now

    "Contiguous" -- you're a node-based organism and you choose nodes to grow out from your body. Different node types can be connected to other node types. 
    Initial nodes would be for consumption (nearby flora) and digestion (converting to usable resources).
    Some nodes may be limited by where they can be placed / which nodes they can be attached to, but maybe we can use a bonuses system.

    Maybe for the contiguous mode, there's a way to split the gameplay difference by allowing the player to (grow and?) "spit out" (or would one be pre grown with like a timer for how quickly a new one can be ready?) a controllable organism to fight / defend 
