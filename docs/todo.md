why are food starting with 0 health?
    (constructor seems to provide health ...)

sound doesn't seem to be dropping off at a distance

I'm pretty sure non-menu actions are still enabled / firing when menus are open

Tiles: {
    need to start having (and drawing) individual tiles

    Debug menu ...
    with option to enable writing on tiles
    tiles contain "x,y <br > graphic <br> modifiers"

    get player and other slimes to "mark" the ground
        later, let player travel through any slimed ground
        travel ability should have a cooldown after doing it before starting again
        (later) also have a stamina affect duration
}

draw equipment menu

we're in the middle of reworking the way things get built
grown could use some love
then we also started on character movement -_-
    we should add a unit test that characters will stop moving when they arrive at their destination with extra time elapsed

allow 'down' and 'up' on menu (but don't need to enable by default)

- (fix) node position selection for stuff to build
    buildings shouldn't be able to build close together. Need a way to visualize this and some tests for it

we need the stuff the player builds directly to grow
    just like what is built by the 'ai'

Creatures close to spawn origin should:
    - have fewer 'points' overall
    - have many of their 'points' allocated to health or armor (or something else?)
    - not be very fast, so they cannot outrun the default player
    - not be able to see (or sense) very far, to react to run from the player threat
As you get further out, you should very quickly start seeing animals with some actual defense / survival

we want player to be able to travel "through" nodes to an edge,
    and essentially excrete themselves a form
    travel speed should be based on the "transfer rate" of nutrients within the hivemind

We should try creating an enemy ant colony to fight
    and 'testing' how that interaction feels with current mechanics

attributes of a biome:
    how mountainous is this biome?
        (expressed as a percentage, 50 is 'a normal amount', 100 is 'as many as possible')
        initialize at 25
        implemented as the chance (in 10000 square grid tiles) of there being a mountain
    what is the biome's average height?
        (expressed as a literal number, negatives will be beneath sea level)
        defaults to 0
    what is the average lake size?
        for bodes of water in this biome, will they be small and numerous, or large and infrequent?
        (expressed as a percentage from 0 to 100, 100 disables land, 0 disables water)

when implementing mountains,
    they're given a height upon creation
        (random range from seed based on biome average height)
    and should 'march down' (making tall tiles around), (also random ranged amounts based on seed)

dont start growing new food if cant reserve enough to grow it to completion
can we make this generic to all growing?

Are spawns having trouble moving when their y is 0?

In Builds.mjs:Build, we should probably call grow()

one seeder per node

nodes should take some time to grow when first placed (by player or by another node)

maximum food reserve?
variable to limit how quickly nodes can "act"
    research that allows more / faster

Need to instantiate nearby chunks on player spawn

buildings issues:
    - consumer slimes too quick
    - too easy to get stuck in not having enough food
        - if we don't have enough food, limit what's grown
    - new nodes have a tendency to 'stack' position

when food levels get low, start siphoning "spare" food off buildings like eaters / seeders

- after killing an enemy
    they should leave behind a corpse
    that needs to be dissolved / broken up
    before being digested
    (maybe eaters 'attach' to something like a corpse and slowly break it down)

- we should reduce the interval for spawning for subdivide

- buildings for: defending
    defense can later break out to either turrets or unit spawners
Defense building should look tougher, more callous:
    Less opaque
    Thicker border

- Once 1 research, can research research and unlock research node which speeds up research

- need visual indicator for cooldown(s)

- Hivemind should be gradually building 'towards' or in the direction of the player,
    from wherever it is
    'prioritizing' the nearest nodes, 
    and expanding nodes towards player when nodes would be selected

- player should slowly gain "influence" over the hive mind
    it should start out very 'rough' at first -- sending commands and stuff should be difficult
    the player's ability to interact with the hivemind,
        as well as the hivemind's ability to function autonomously
        should need to grow from a base state to where we have it now(ish)
    these should work like passive upgrades (and we should ideally describe this very thing less generically)

- Enemy technologies:
    - poison,
    - shell (protective)

- Building "find empty plot" method 
    (after a little physics / collision maybe?)
    we also probably need methods for comparing areas rather than points

- maybe some terrain variety? Mountains, valleys, water
    obstacles like trees, rocks

- need to have some collision

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

- Combat Log:
    add an "ignoreInput" menu property, to allow it to open without stealing focus

- priorities for targets for player acquisition
    Animal > Native Flora > Player Spawns (maybe just use a "whose hostility property is highest"?)

status effect applications (fear, running) in combat log?

---

- I think we need to have min and max aggression (and other things that get random)
in part to be able to determine what % of max aggression a creature is
(which will help us "paint it redder" to visually indicate)

- Upgrade that lets you make spawned slimes stronger (more health, speed, yield when gathering) in exchange for being more expensive

- Research to be able to automatically absorb things X smaller than you

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
    