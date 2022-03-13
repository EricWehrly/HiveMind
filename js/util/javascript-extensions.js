// I'm not really sure this is javascript language extension anymore ...
export function AssignWithUnderscores(target, source) {

    for(var key of Object.keys(source)) {

        if(target["_" + key]) {
            target["_" + key] = source[key];
            delete source[key];
        }
    }

    Object.assign(target, source);
}
