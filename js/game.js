import managedImport from './util/managed-import.js';

await managedImport('./util/javascript-extensions.js');
await managedImport('./util/custom-style.js');

// const tileFile = `./tile.mjs?ver=${performance.now()}`;
// const Tile = await import(tileFile);
// import Tile from './tile.mjs';
// eventually if we keep building this out, we should create a dividing line between the 'game' and the 'game engine'
// and import the latter from a separate repository
const Tile = await managedImport('./mapping/tile.mjs');
const TileManager = await managedImport('./mapping/tile-manager.mjs');
const Character = await managedImport('./entities/character.mjs');
const KeyboardController = await managedImport('./controls/keyboard-controller.mjs');

let someTile = new Tile();

const localPlayer = new Character();
new KeyboardController({ character: localPlayer });

console.log('Starting game.');