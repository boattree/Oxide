Rust-3D Prototype (Three.js) — MVP

=================================



What

----

A 3D browser-playable Rust-inspired survival prototype built with Three.js and ES modules.

Core loop: gather → craft → build → defend/attack. Single-player in-browser prototype.



Run (recommended)

-----------------

1\. Open a terminal in the project folder.

2\. Run a tiny HTTP server:



&nbsp;  Python 3:

&nbsp;    python -m http.server 8000



3\. Open your browser:

&nbsp;    http://localhost:8000



Controls

--------

\- Click canvas -> locks mouse cursor

\- WASD: move

\- Mouse: look

\- E: interact (gather/place/open)

\- I: open inventory

\- C: open crafting

\- B: toggle build mode



Project layout

--------------

\- index.html

\- style.css

\- src/

&nbsp; - engine.js (entry)

&nbsp; - render.js (Three.js scene)

&nbsp; - worldgen.js (terrain + resource nodes)

&nbsp; - player.js (first-person movement \& interactions)

&nbsp; - inventory.js, crafting.js

&nbsp; - building.js (placement \& structures)

&nbsp; - ai.js (animals)

&nbsp; - persistence.js (localStorage)

&nbsp; - network.js (WebSocket stub)

&nbsp; - utils.js, tests.js



Persistence

-----------

Saves to localStorage key `rust3d\_save\_v1`.



Extending

---------

\- Add server (Node.js) and validate actions server-side for multiplayer.

\- Replace localStorage with IndexedDB for larger saves.

\- Add better terrain using Perlin noise lib, texture atlases, animations.



License

-------

Procedural/simple assets — free to reuse and extend.



