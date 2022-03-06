
// https://stackoverflow.com/a/48217124/5450892
async function requestModule(moduleFileName) {

    const requestModuleFile = ({url, dataURL = true}) => 
      new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        const reader = new FileReader();
        reader.onload = () => { resolve(reader.result) };
        request.open("GET", url);
        request.responseType = "blob";
        request.onload = () => { reader[dataURL ? "readAsDataURL" : "readAsText"](request.response) };
        request.send();
     })
  
    let moduleName = `Mod`;
    // get `Mod` module
    let moduleRequest = await requestModuleFile({url:moduleFileName});
    // do stuff with `Mod`; e.g., `console.log(Mod)`
    // let moduleBody = await requestModuleFile({url:"ModBody.js", dataURL: false}); 
    // let scriptModule = `import {${moduleName}} from "${moduleRequest}"; ${moduleBody}`;
    let scriptModule = `import "${moduleRequest}"`;
    let script = document.createElement("script");
    script.type = "module";
    script.textContent = scriptModule;
    document.body.appendChild(script);

}
