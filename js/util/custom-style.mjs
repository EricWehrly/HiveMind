const CUSTOM_STYLE_NODE = document.createElement("style");
document.head.appendChild(CUSTOM_STYLE_NODE);

// we should add functionality for removing / updating, later
export default function addCustomStyle(cssString) {

    const domElement = document.createTextNode(cssString);
    CUSTOM_STYLE_NODE.appendChild(domElement);
}

if(window) window.addCustomStyle = addCustomStyle;
