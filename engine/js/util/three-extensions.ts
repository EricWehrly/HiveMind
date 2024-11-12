import * as THREE from 'three';

declare module 'three' {
    interface Euler {
        toString(): string;
    }

    interface Vector3 {
        toString(): string;
    }
}

THREE.Euler.prototype.toString = function (): string {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}, order: ${this.order})`;
};

THREE.Vector3.prototype.toString = function (): string {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
}
