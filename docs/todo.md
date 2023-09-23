- priorities for targets for player acquisition
    Animal > Native Flora > Player Spawns

- buildings for: defending
    defense can later break out to either turrets or unit spawners
    Once 1 research, can research research and unlock research node which speeds up research

- enemies should also attack player entities (spawns, and buildings)
    (let's see if the logs show us enemies targeting hunters)
    (then we'll need to work on buildings afterwards)

- maybe buildings should work like:
    - you hit 'B' to drop a new node (in exchange for food, as now)
    - that node will auto-expand with its own AI (as we've kind of described in other notes,
        with some kind of like 'nearby proximity prioritization' -- if desired not in range, add)
    - player can similarly pay to choose to make a building a specific type
        but maybe that functionality ( / player choice / influence) can wait until later

- conquest target
    The player is trying to saturate the planet with a critical mass of your hive mind
    Start small with this, we can expand.
    Use fixed numbers / amounts,
    and just add a visual indicator for how far along we are
    and if we've "won"

- Enemy technologies:
    - poison,
    - shell (protective)

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
    Working towards "critical mass" for the planet. Don't need to take everything over, just spread enough. 
    Bigger planet needs more to reach critical mass 
    More biodiverse planet also needs more
    