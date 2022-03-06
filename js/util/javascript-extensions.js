
export function customStylesheet(options = {}) {

    console.log("Adding custom stylesheet");

    const stylesheet = document.createElement('stylesheet');
    stylesheet.id = options.id || crypto.randomUUID();
    document.body.appendChild(stylesheet);

    return stylesheet;
}