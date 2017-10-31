import { deepFreeze } from './util';

export type Id = number;

export const getId = (() => {
    let c = 0;
    return () => c++;
})();

export class Environment {
    readonly active: Id[];
    readonly waiting: Id[];

    constructor(active: Id[] = [], waiting: Id[] = []) {
        this.active = active;
        this.waiting = waiting;
        deepFreeze(this);
    }

    totalCount(): number {
        return this.active.length + this.waiting.length
    }

    addToPool(n: Id): Environment {
        const new_waiting = this.waiting.filter(_ => true);
        new_waiting.push(n);
        return new Environment(this.active, new_waiting);
    }

    remove(n: Id): Environment {
        const new_active = this.active.filter(x => x != n);
        const new_waiting = this.waiting.filter(x => x != n);
        return new Environment(new_active, new_waiting)
    }

    aquire(): Environment {
        const new_active = this.active.filter(_ => true);
        const new_waiting = this.waiting.filter(_ => true);

        if (new_waiting.length == 0) {
            console.warn("NONE LEFT");
            return this;
        } else {
            new_active.push(new_waiting.pop() as number);
            return new Environment(new_active, new_waiting);
        }
    }
}
