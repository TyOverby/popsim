import { Clock } from './clock';
import { Id, Environment, getId } from './environment';
import config from './constants';
import * as actions from './actions';

type Callback = (time: number, count_idle: number, count_in_use: number, count_in_flight: number) => void;

function simulate(duration: number, callback: Callback) {
    const environment = new Environment();
    const clock = new Clock();

    const log = () => callback(
        clock.elapsed,
        environment.idle.length,
        environment.leased.length,
        environment.creating.length);

    const kill = (id: Id) => {
        environment.remove(id)
    }

    const spawn = () => {
        const id = getId();

        environment.start_create(id);

        clock.schedule(config('agent-creation-duration'), () => {
            environment.finish_create(id);
            clock.schedule(config('agent-life-duration'), () => kill(id))
        });
    };

    const topOff = () => {
        const lower_bound_count = config('agent-target-count');
        const top_off_count = lower_bound_count - (environment.idleCount + environment.creatingCount);
        const should_top_off = top_off_count > 0;
        if (should_top_off) {
            for (let i = 0; i < top_off_count; i++) {
                spawn();
            }
        }
        if (!should_top_off || config('always-stagger')) {
            const repop_extra_count = config('stagger-count');
            for (let i = 0; i < repop_extra_count; i++) {
                clock.schedule(i, spawn);
            }
        }
    };

    const usage = () => {
        environment.aquire();
        for (let i = 0; i < config('fork-factor'); i++) {
            spawn();
        }
    };

    if (config('cold-start')) {
        // do nothing
    } else {
        const bound_count = config('agent-target-count');
        const is_full = config('full-start');
        const is_staggered = config('staggered-start');
        for (let i = 0; i < bound_count; i++) {
            const life = config('agent-life-duration');
            const id = getId();
            environment.addToPool(id);

            if (is_full) {
                clock.schedule(life, () => kill(id));
            } else if (is_staggered) {
                clock.schedule(life * ((i + 1) / bound_count), () => kill(id));
            } else {
                throw new Error("NO STARTING CONDITION CHECKED")
            }
        }
    }

    log();
    clock.scheduleRepeating(() => config('log-interval'), log);
    clock.scheduleRepeating(() => config('repopulate-interval'), topOff);
    clock.scheduleRepeating(() => config('aquisition-interval'), usage);

    while (true) {
        clock.makeProgress();
        if (clock.elapsed >= duration || clock.actions.length == 0) {
            return;
        }
    }
}

export default simulate;
