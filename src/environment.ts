export type Id = number;

export const getId = (() => {
    let c = 0;
    return () => c++;
})();

export class Environment {
    leased: Id[] = [];
    idle: Id[] = [];
    creating: Id[] = [];
    on_fail: () => void;

    constructor(fail_callback: () => void) {
        this.on_fail = fail_callback;
    }

    get leasedCount(): number {
        return this.leased.length;
    }

    get idleCount(): number {
        return this.idle.length;
    }

    get creatingCount(): number {
        return this.creating.length;
    }

    addToPool(id: Id) {
        this.idle.push(id)
    }

    start_create(id: Id) {
        this.creating.push(id);
    }

    finish_create(id: Id) {
        let idx = this.creating.indexOf(id);
        this.creating.splice(idx, 1);
        this.idle.push(id);
    }

    remove(id: Id) {
        const leasedIdx = this.leased.indexOf(id);
        if (leasedIdx != -1) {
            this.leased.splice(leasedIdx, 1);
        } else {
            const idleIdx = this.idle.indexOf(id);
            if (idleIdx != -1) {
                this.idle.splice(idleIdx, 1);
            }
        }
    }

    isIdle(id: Id): boolean {
        return this.idle.indexOf(id) != -1;
    }

    isLeased(id: Id): boolean {
        return this.leased.indexOf(id) != -1;
    }

    aquire(): Id {
        const env = this.idle.pop();
        if (env === undefined) {
            this.on_fail();
            return -1;
        } else {
            this.leased.push(env);
            return env;
        }
    }
}
