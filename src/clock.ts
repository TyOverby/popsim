import { Environment } from './environment';

export type Action = () => void;

interface ScheduledAction {
    timeout: number,
    readonly action: Action,
}

export class Clock {
    readonly actions: ScheduledAction[] = [];
    elapsed: number = 0;

    schedule(timeout: number, action: Action) {
        let index = -1;

        for (let i = 0; i < this.actions.length; i++) {
            if (this.actions[i].timeout < timeout) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            this.actions.push({ timeout, action });
        } else {
            this.actions.splice(index, 0, { timeout, action });
        }
    }

    scheduleRepeating(timeout: () => number, action: Action) {
        this.schedule(timeout(), () => {
            action();
            this.scheduleRepeating(timeout, action);
        });
    }

    makeProgress() {
        if (this.actions.length == 0) { return }

        let { timeout, action } = this.actions.pop() as ScheduledAction;
        for (const remain of this.actions) {
            remain.timeout -= timeout;
        }

        this.elapsed += timeout;

        action();
    }
}
