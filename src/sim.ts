import { Clock } from './clock';
import { Environment } from './environment';
import { Constants } from './constants';
import * as actions from './actions';

type Callback = (time: number, count_idle: number, count_in_use: number) => void;

function simulate(duration: number, callback: Callback) {
    let environment = new Environment();
    let clock = new Clock();

    clock = clock.scheduleRepeating(Constants.log_interval_time(), (clock, env) => {
        callback(clock.elapsed, env.waiting.length, env.active.length);
        return [clock, env]
    });
    [clock, environment] = actions.top_off_rand(clock, environment);
    clock = clock.scheduleRepeating(Constants.repopulate_interval_time(), actions.top_off);

    while (true) {
        [clock, environment] = clock.tick(environment);
        if (clock.elapsed >= duration || clock.actions.length == 0) {
            return;
        }
    }
}

export default simulate;
