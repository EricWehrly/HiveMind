Performance {
    don't update combat log if it's collapsed. Cache instead and render when it unrolls

    don't 'update' resource ui values if they're not changed
    also, debounce painted updates to 1s
 
    try to convert Maps to WeakMaps where possible, foor memory optimization benefits   
}

bug / sanitization {
- remove any places where the engine is depending on the game itself
    we can identify these by (hopefully) counting (relative) slashes?
    (easily identifiable offending engine components should have more '../' than possible, at least for their level)

- evaluate circular dependencies
`dpdm --no-warning --no-tree ./js/game.ts`

    get rid of ': any'
    get rid of 'as unknown'
    (we know ways around both now)
}

We should be able to start 'compositing' all of the implementing Entity constructor types
to be EntityOptions & ... whatever properties...
the next (obvious) mixin is probably 'Sentient' -- we just touched a bunch of stuff adjacent to it
