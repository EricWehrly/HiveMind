# HiveMind

A little game experiment.

Forager but you're a hive mind. So far.

---

What we can do:
- Fight monsters
- Build buildings

Kinda can: 
- Multiplayer, ish.

Want to do:
- Have monsters fight back
- Evolutions and stuff ... like, the player getting stronger (faster, +damage, +def) ...
- "interesting" monster behavior AI
- Learn new moves from monsters
- Grow player power from built buildings
    (gaining food)
- Use food for stuff like .. learning new skills?

## Development

`docker build . -t hivemind && docker run --init -it -v /$(pwd):/hivemind -p 5000:5000 hivemind`

---

Extra scripts were added to do cache busting manually but boy it was late and I wasn't thinking.

Caching can be disabled in Chrome (when dev tools is open) by:

Opening dev tools 

Clicking the settings gear

Under preferences, there is a section labeled "Network"

Which has a checkbox for "Disable cache (while DevTools is open)"

--

Alternatively, the server can be configured with a response header `Cache-Control:no-cache, no-store`

https://stackoverflow.com/a/23944114/5450892

To do so in the [HFS file server](https://www.rejetto.com/hfs/):

At the hfs console, press Alt+F6 to edit the events file

Add the following:
```[+request]
{.add header|Cache-Control: no-cache, max-age=0.}```

per [forums](https://rejetto.com/forum/index.php?topic=11741.msg1066920#msg1066920)