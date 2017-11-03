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

        for (let i = environment.idleCount + environment.creatingCount; i < lower_bound_count; i++) {
            spawn();
        }

    };

    const schedule_stagger = () => {
        const repop_extra_count = config('stagger-count');
        for (let i = 0; i < repop_extra_count; i++) {
            clock.schedule(i, spawn);
        }
    };

    const usage = () => {
        environment.aquire();
        for (let i = 0; i < config('fork-factor'); i++) {
            spawn();
        }
    };

    if (!config('cold-start')) {
        // starting sim
        const bound_count = config('agent-target-count');
        for (let i = 0; i < bound_count; i++) {
            const life = config('agent-life-duration');
            const id = getId();
            environment.addToPool(id);
            clock.schedule(life * ((i + 1) / bound_count), () => kill(id));
        }
    }


    log();
    clock.scheduleRepeating(() => config('log-interval'), log);
    clock.scheduleRepeating(() => config('repopulate-interval'), topOff);
    clock.scheduleRepeating(() => config('aquisition-interval'), usage);

    if (config('use-stagger')) {
        clock.scheduleRepeating(() => config('stagger-interval'), schedule_stagger);
    }


    while (true) {
        clock.makeProgress();
        if (clock.elapsed >= duration || clock.actions.length == 0) {
            return;
        }
    }
}

export default simulate;
