- Predator AI doesn't seem to give up chasing player
    put a console log on the leash releasing the target,
    and then note here that we did that -- in case we did and forgot ...

- why are chunks not generating in the negative (left and top)?

- need some kind of indicator for doing research

- it's time to refactor chunks to only generate for players
    We can use the Events.Context that we started ...

- list of entities targeting the player?
    very helpful for debug
    but could easily be a proper game mechanic later
    with upgrades incrementing through to that eventual result

- enemies should also attack player entities (spawns, and buildings)

- I think we need to have min and max aggression (and other things that get random)
in part to be able to determine what % of max aggression a creature is
(which will help us "paint it redder" to visually indicate)

- Enemy technologies:
    - poison,
    - thorns (unless we finished this?),
    - shell (protective)

- Maybe learning new technologies should work like:
    - the more you already know, the more pieces (of a new one) that you need to collect in order to research
    - but the more you know, the shorter it is to research?

- The more evolved an attack is, the longer it takes the player to switch to it.
Should be able to switch to a new attack even if switch in progress is not complete
- - Also needs implemented ability to switch between attacks / equipment...

- Research to be able to automatically absorb things X smaller than you

- buildings for: doing research, defending, healing
    defense can later break out to either turrets or unit spawners
    Once 1 research, can research research and unlock research node which speeds up research

- Camera controls & following player
    rendering controller or something for other entities
    smooth movement? tweening? speed and accel?
    when player faces a direction, the camera should "shift" in that direction, such that the player is off-center on the screen, with the 'peeked' direction taking some amount

- priorities for targets for player acquisition
    Animal > Native Flora > Player Spawns

- need to have some collision

- need to finish implementing biomes

- maybe some terrain variety? Mountains, valleys, water
    obstacles like trees, rocks

- time to try networking with webrtc signal and turn ... can probably just stand up a docker on localhost for now

- Upgrade that let's you make spawned slimes stronger (more health, speed, yield when gathering) in exchange for being more expensive

- I think the "chunk" graphic could be a bordered-box that's sized and colored to the chunk ...

---

- Tech tree with evolutions for one track incorporating with local fauna
    and another track just being an all-consuming

- There's a node you can build that allows you to (slowly) beam back things you learn from the tech tree to the universal hive mind (persists between runs)
    Conversely, you're only allowed to send a finite information to new runs, so the node would also be downloading researched techs from the tree.

- End goal:
    Working towards "critical mass" for the planet. Don't need to take everything over, just spread enough. 
    Bigger planet needs more to reach critical mass 
    More biodiverse planet also needs more
    