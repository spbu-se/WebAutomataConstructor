export class Stack<T> {
    private storage: T[] = [];

    constructor(private capacity: number = Infinity) {}

    push(item: T): void {
        if (this.size() === this.capacity) {
            throw Error("Stack has reached max capacity, you cannot add more items");
        }
        this.storage.push(item);
    }

    pop(): T | undefined {
        return this.storage.pop();
    }

    peek(): T | undefined {
        return this.storage[this.size() - 1];
    }

    size(): number {
        return this.storage.length;
    }

    getStorage(): T[] {
        let list: T[] = []
        this.storage.forEach(value => list.push(value))
        return list
    }

    cpyTo(stack: Stack<T>): Stack<T> {
        this.storage.forEach(value => stack.push(value))
        return stack
    }
}
