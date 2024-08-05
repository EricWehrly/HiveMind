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