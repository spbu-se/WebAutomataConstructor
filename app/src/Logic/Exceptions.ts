export class NonDeterministic extends Error {
    constructor() {
        super();
        this.name = 'NonDeterministic';
        Object.setPrototypeOf(this, NonDeterministic.prototype)
    }
}

export class NonMinimizable extends Error {
    constructor() {
        super();
        this.name = 'NonMinimizable';
        Object.setPrototypeOf(this, NonMinimizable.prototype)
    }
}