console.debug('Loaded game.js');

import managedImport from './managed-import.js';

// const tileFile = `./tile.mjs?ver=${performance.now()}`;
// const Tile = await import(tileFile);
// import Tile from './tile.mjs';
const Tile = await managedImport('./tile.mjs');

let someTile = new Tile();

console.log('Starting game.');