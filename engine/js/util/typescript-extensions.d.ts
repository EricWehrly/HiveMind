declare global {
    interface Array<T> {
        /**
         * Removes the first occurrence of a specified element from the array.
         * @param {T} element - The element to remove.
         * @returns {boolean} - Returns true if the element was found and removed, otherwise false.
         */
        remove(element: T): boolean;
    }
}

export {};
