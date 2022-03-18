const Requirements = {
    met(obj) {
        if(obj.requires) {
            if(obj.requires.technology) {
                if(typeof obj.requires.technology == "string") {
                    if(obj.technologies && obj.technologies.contains(obj.requires.technology)) return true;
                } else {
                    // TODO: if object, array, etc.
                    console.warn("I don't know how to handle that!");
                }
                return false;
            }
        }
        return true;
    }
}

export default Requirements;
