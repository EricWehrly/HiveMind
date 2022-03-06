// https://stackoverflow.com/a/48133721/5450892
/**
 * Usage: `const someModule = await managedImport('modulePath')`
 * @param {string} filePath Path to the module to import.
 * @param {boolean} cacheBust Append a cache busting parameter to the script
 * @param {boolean} addToWindow Rather than returning a module, assign all functions to the window object
 * @returns the first exported part of the module
 */
export default async function managedImport(filePath, cacheBust = true, addToWindow = false) {

    // TODO: Try/catch
    const moduleFile = cacheBust ? `../${filePath}?v=${performance.now()}`
        : `../${filePath}`;
    const theModule = await import(moduleFile);

    if(addToWindow) {
        for(var key of Object.keys(theModule)) {
            console.log(`Adding ${key} to window.`);
            window[key] = theModule[key];
        }
    } else {
        // TODO: We should probably only be doing this if key 0 is "default"
        const key = Object.keys(theModule)[0];
    
        return theModule[key];
    }
}