const Duplicates: Record<string, string[]> = {};

function IsDuplicate(keyName: string, id: string) {
    let collection = Duplicates[keyName];
    if(!collection) {
        Duplicates[keyName] = [id];
    } else if(id in collection) {
        return true;
    } else {
        collection.push(id);
    }
    return false;
}

export function WarnForDuplicates(keyName: string, id: string) {
    if (IsDuplicate(keyName, id)) {
        console.warn(`Duplicate event ${keyName} with id ${id}.`);
    }
}
