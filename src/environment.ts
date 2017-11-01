export type Id = number;

export const getId = (() => {
    let c = 0;
    return () => c++;
})();

export class Environment {
    leased: Id[] = [];
    idle: Id[] = [];
    creating: Id[] = [];

    totalCount(): number {
        return this.leased.length + this.idle.length
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

    aquire() {
        if (this.idle.length == 0) {
            console.warn("NONE LEFT");
        } else {
            this.leased.push(this.idle.pop() as number);
        }
    }
}
