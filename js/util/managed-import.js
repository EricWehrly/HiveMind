// https://stackoverflow.com/a/48133721/5450892
/**
 * Usage: `const someModule = await managedImport('modulePath')`
 * @param {string} filePath Path to the module to import.
 * @param {boolean} cacheBust Whether or not to append a cache busting parameter
 * @returns the first exported part of the module
 */
export default async function managedImport(filePath, cacheBust = true) {

    // TODO: Try/catch
    const moduleFile = cacheBust ? `../${filePath}?v=${performance.now()}`
        : `../${filePath}`;
    const theModule = await import(moduleFile);
    const key = Object.keys(theModule)[0];

    return theModule[key];
}