// I'm not really sure this is javascript language extension anymore ...
export function AssignWithUnderscores(target, source) {

    for(var key of Object.keys(source)) {

        if(target["_" + key]) {
            source["_" + key] = source[key];
            delete source[key];
        }

        // if source[key] has keys
        // object assign the value
        // recursively ...
    }

    mergeDeep(target, source);
    // Object.assign(target, source);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }
  
  // TODO: Max depth
  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   * https://stackoverflow.com/a/34749873/5450892
   */
  export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
  
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  
    return mergeDeep(target, ...sources);
  }

// https://stackoverflow.com/a/69057776/5450892
export function GetColorAsRGBA(color) {

    // gc should clean this up for us
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0,0,1,1);
    return context.getImageData(0,0,1,1).data;
}

export function generateId(len) {
  var arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}

export function dec2hex (dec) {
    return ('0' + dec.toString(16)).substr(-2)
}
