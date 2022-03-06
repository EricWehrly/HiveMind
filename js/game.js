import managedImport from './util/managed-import.js';

await managedImport('./util/javascript-extensions.js', true, true);

// const tileFile = `./tile.mjs?ver=${performance.now()}`;
// const Tile = await import(tileFile);
// import Tile from './tile.mjs';
const Tile = await managedImport('./tile.mjs');
const TileManager = await managedImport('./tile-manager.mjs');
const Player = await managedImport('./player.mjs');

let someTile = new Tile();

let localPlayer = new Player();

console.log('Starting game.');