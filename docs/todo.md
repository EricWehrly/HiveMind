- would be nice to make a UI (options?) that shows which keys are bound

- create a ui element showing player size
    within debug menu

- set up a map object or some mechanism for spawning new entities as the player explores around

- Camera controls & following player
    rendering controller or something for other entities
    smooth movement? tweening? speed and accel?
    when player faces a direction, the camera should "shift" in that direction, such that the player is off-center on the screen, with the 'peeked' direction taking some amount

- setting up player structures with purposes

- time to try networking with webrtc signal and turn ... can probably just stand up a docker on localhost for now

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