import { Environment } from './environment';
import { deepFreeze } from './util';

export type Action = (clock: Clock, env: Environment) => [Clock, Environment];

interface ScheduledAction {
    readonly timeout: number,
    readonly action: Action,
}

export class Clock {
    readonly actions: ScheduledAction[];
    readonly elapsed: number;

    constructor(actions: ScheduledAction[] = [], elapsed: number = 0) {
        this.actions = actions;
        this.elapsed = elapsed;
        deepFreeze(this);
    }

    schedule(timeout: number, action: Action): Clock {
        const new_actions = this.actions.filter(_ => true);
        new_actions.push({ timeout, action });
        return new Clock(new_actions, this.elapsed)
    }

    scheduleRepeating(timeout: number, action: Action): Clock {
        const f: Action = (clock: Clock, env: Environment) => action(clock.schedule(timeout, f), env);
        return this.schedule(timeout, f);
    }

    tick(env: Environment): [Clock, Environment] {
        if (this.actions.length == 0) { return [this, env] }

        const actions_cloned = this.actions.filter(_ => true);
        actions_cloned.sort((a, b) => a.timeout - b.timeout);

        let { timeout, action } = actions_cloned.shift() as ScheduledAction;
        const result_actions = actions_cloned.map(a => ({action: a.action, timeout: a.timeout - timeout}))

        return action(new Clock(result_actions, this.elapsed + timeout), env);
    }
}
