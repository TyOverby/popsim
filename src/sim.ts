import { Clock } from './clock';
import { Id, Environment, getId } from './environment';
import config, { pm } from './constants';
import { deltas } from './traffic';

type Callback = (time: number, count_idle: number, count_in_use: number, count_in_flight: number) => void;

function simulate(duration: number, callback: Callback) {
    let failed = 0;
    const environment = new Environment(() => failed += 1);
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
            clock.schedule(config('agent-life-duration'), () => {
                if (!environment.isLeased(id) ){
                    kill(id)
                }
            })
        });
    };

    const topOff = () => {
        const lower_bound_count = config('agent-target-count');
        const top_off_count = lower_bound_count - (environment.idleCount + environment.creatingCount + environment.leasedCount);
        const should_top_off = top_off_count > 0;
        if (should_top_off) {
            for (let i = 0; i < top_off_count; i++) {
                spawn();
            }
        } else {
            const defaultLifespan = config('agent-life-duration');
            for (let i = 0; i < defaultLifespan / 4; i++) {
                clock.schedule((i + 1) * 2, spawn);
            }
        }
    };

    const lease = () => {
        const id = environment.aquire();
        clock.schedule(config('agent-lease-duration'), () => kill(id));
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
    clock.scheduleRepeating(() => config('aquisition-interval'), lease);
    if (config('use-traffic')) {
        for (const ts of deltas) {
            clock.schedule(ts, lease);
        }
    }

    while (true) {
        clock.makeProgress();
        if (clock.elapsed >= duration || clock.actions.length == 0) {
            const floater = document.querySelector("#floater");
            if (floater) {
                floater.innerHTML = `${failed} failed`;
            }
            return;
        }
    }
}

export default simulate;
