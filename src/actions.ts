import { Clock } from './clock';
import { Environment, getId } from './environment';
import { Constants } from './constants';

/*
export function log(clock: Clock, env: Environment): [Clock, Environment] {
    console.log(env);
    return [clock, env];
}

export function spawn(clock: Clock, env: Environment): [Clock, Environment] {
    let id = getId();
    let time_to_birth = Constants.time_to_birth();
    let new_clock = clock.schedule(time_to_birth, (clock, env) => [clock, env.addToPool(id)])
        .schedule(time_to_birth + Constants.life_time(), (clock, env) => {
            return [clock, env.remove(id)]
        });
    return [new_clock, env]
}

export function top_off(clock: Clock, env: Environment): [Clock, Environment] {
    for (var i = env.totalCount(); i < Constants.lower_bound_count(); i++) {
        [clock, env] = spawn(clock, env);
    }
    return [clock, env]
}

export function top_off_rand(clock: Clock, env: Environment): [Clock, Environment] {
    for (var i = 0; i < Constants.lower_bound_count(); i++) {
        const time_to_kill = Math.random() * Constants.life_time();
        const id = getId();
        clock = clock.schedule(time_to_kill, (clock, env) => [clock, env.remove(id)]);
        env = env.addToPool(id);
    }
    return [clock, env]
}

*/
