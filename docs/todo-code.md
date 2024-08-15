remove any places where the engine is depending on the game itself
    we can identify these by (hopefully) counting (relative) slashes?
    (easily identifiable offending engine components should have more '../' than possible, at least for their level)

- evaluate circular dependencies
`dpdm --no-warning --no-tree ./js/game.ts`

try to convert Maps to WeakMaps where possible, foor memory optimization benefits

get rid of ': any'
get rid of 'as unknown'
(we know ways around both now)

We should be able to start 'compositing' all of the implementing Entity constructor types
to be EntityOptions & ... whatever properties...
dude, we need to get rid of the ts-nocheck in character...
the next (obvious) mixin is probably 'Sentient' -- we just touched a bunch of stuff adjacent to it
