import { Clock } from './clock';
import { Environment, getId } from './environment';
import { Constants } from './constants';
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

    const kill = (id) => {
        if (environment.isIdle(id) && environment.totalCount() <= Constants.lower_bound_count()) {
            environment.remove(id)
        } else {
            environment.remove(id)
        }
    }

    const spawn = () => {
        const id = getId();

        environment.start_create(id);

        clock.schedule(Constants.time_to_birth(), () => {
            environment.finish_create(id);
            clock.schedule(Constants.life_time(), () => kill(id))
        });
    };

    const topOff = () => {
        for (let i = environment.totalCount(); i < Constants.lower_bound_count(); i++) {
            spawn();
        }
    };

    const usage = () => {
        environment.aquire();
        for (let i = 0; i < Constants.fork_factor(); i++) {
            spawn();
        }
    };

    // starting sim
    const bound_count = Constants.lower_bound_count();
    for (let i = 0; i < bound_count; i++) {
        const life = Constants.life_time();
        const id = getId();
        environment.addToPool(id);
        clock.schedule(life * ((i + 1) / bound_count), () => kill(id));
        //clock.schedule(life * Math.random(), () => kill(id));
    }

    log();
    clock.scheduleRepeating(Constants.log_interval_time, log);
    clock.scheduleRepeating(Constants.repopulate_interval_time, topOff);
    clock.scheduleRepeating(Constants.aquisition_rate, usage);


    while (true) {
        clock.makeProgress();
        if (clock.elapsed >= duration || clock.actions.length == 0) {
            return;
        }
    }
}

export default simulate;
