dont start growing new food if cant reserve enough to grow it to completion
can we make this generic to all growing?

when food levels get low, start siphoning "spare" food off buildings like eaters / seeders

We ideally want to leave the player some margin of food to work with, rather than running everything to 0 all the time

buildings issues:
    - consumer slimes too quick
    - too easy to get stuck in not having enough food
        - if we don't have enough food, limit what's grown
        - debugger when trying to take food when value < 100 ...
    - new nodes have a tendency to 'stack' position

Are spawns having trouble moving when their y is 0?

- we should reduce the interval for spawning for subdivide

- buildings for: defending
    defense can later break out to either turrets or unit spawners
    Once 1 research, can research research and unlock research node which speeds up research

Defense building should look tougher, more callous:
Less opaque
Thicker border

Maybe spawner should look wide and short 

- need visual indicator for cooldown(s)

- Enemy technologies:
    - poison,
    - shell (protective)

- Building "find empty plot" method 
    (after a little physics / collision maybe?)
    we also probably need methods for comparing areas rather than points

- need to finish implementing biomes

- maybe some terrain variety? Mountains, valleys, water
    obstacles like trees, rocks

- need to have some collision

- Camera controls & following player
    rendering controller or something for other entities
    smooth movement? tweening? speed and accel?
    when player faces a direction, the camera should "shift" in that direction, such that the player is off-center on the screen, with the 'peeked' direction taking some amount

- The more evolved an attack is, the longer it takes the player to switch to it.
Should be able to switch to a new attack even if switch in progress is not complete
- - Also needs implemented ability to switch between attacks / equipment...

- Maybe learning new technologies should work like:
    - the more you already know, the more pieces (of a new one) that you need to collect in order to research
    - but the more you know, the shorter it is to research?

- Mountains spawn streams
    - which spawn food
        - which attract (spawn) fauna

- Learned / research punch attack that's faster & stronger than slap, and is kind of a mid game attack?
    it'd be pretty cool if we had other attack modifiers 
    (we kinda started with poison, but there's got to be cooler ways we can go with that)
    so the player can tech a build like hades ...

- Combat Log "ignoreInput" menu property to allow open without stealing focus
    ( basically rather than "collapsed" )

- priorities for targets for player acquisition
    Animal > Native Flora > Player Spawns

Rather than a broad Ai, each 'node' (or structure) should only be able to think about either 
    doings it's job, or building another node 
    Until whichever it chooses has finished, and it can reconsider

---

- I think starting a 2nd research screws up one already researching?

- shouldn't be able to open a menu when another menu is already open

- I think we need to have min and max aggression (and other things that get random)
in part to be able to determine what % of max aggression a creature is
(which will help us "paint it redder" to visually indicate)

- time to try networking with webrtc signal and turn ... can probably just stand up a docker on localhost for now

- Upgrade that let's you make spawned slimes stronger (more health, speed, yield when gathering) in exchange for being more expensive

- Research to be able to automatically absorb things X smaller than you

- I think the "chunk" graphic could be a bordered-box that's sized and colored to the chunk ...

- list of entities targeting the player?
    very helpful for debug
    but could easily be a proper game mechanic later
    with upgrades incrementing through to that eventual result

---

- Tech tree with evolutions for one track incorporating with local fauna
    and another track just being an all-consuming

- There's a node you can build that allows you to (slowly) beam back things you learn from the tech tree to the universal hive mind (persists between runs)
    Conversely, you're only allowed to send a finite information to new runs, so the node would also be downloading researched techs from the tree.

- End goal:
    Bigger planet needs more to reach critical mass 
    More biodiverse planet also needs more
    