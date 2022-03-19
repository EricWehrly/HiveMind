const Requirements = {
    met(obj, character) {
        if(obj.requires) {
            if(obj.requires.technology) {
                if(typeof obj.requires.technology == "string") {
                    if(obj.technologies && obj.technologies.includes(obj.requires.technology)) return true;
                    if(character && character.hasTechnology(obj.requires.technology)) return true;
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
