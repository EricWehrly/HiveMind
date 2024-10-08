interface Math {
    randomBetween(min: number, max: number): number;
}

interface Number {
    clamp(min: number, max: number): number;
}

interface Array<T> {
    remove(element: T): boolean;
}

/**
 * Removes the first occurrence of a specified element from the array.
 * @param {T} element - The element to remove.
 * @returns {boolean} - Returns true if the element was found and removed, otherwise false.
 */
Array.prototype.remove = function<T>(this: T[], element: T): boolean {
    const index = this.indexOf(element);
    if (index > -1) {
        this.splice(index, 1);
        return true;
    }
    return false;
};
