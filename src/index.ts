import simulate from './sim';
import { Chart } from 'chart.js';
import { Constants } from './constants';

const canvas = document.querySelector("canvas");
let chart: Chart | null = null;

function run_simulation(timespan: number) {
    const labels: string[] = [];
    const idle_values: number[] = [];
    const use_values: number[] = [];

    simulate(timespan, (t, idle, in_use) => {
        labels.push(t.toFixed(2));
        idle_values.push(idle);
        use_values.push(in_use);
    });

    if (chart !== null) { chart.destroy() }


    chart = new Chart(canvas as HTMLCanvasElement, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'idle',
                data: idle_values,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255,99,132,1)',
                borderWidth: 1
            }, {
                label: 'in use',
                data: use_values,
                backgroundColor: 'rgba(99, 255, 132, 0.2)',
                borderColor: 'rgba(40,140,70,1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: { display: false },
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
}


function bind_property_to_setting(id: string, prop: string) {
    const element = document.querySelector("#" + id) as HTMLInputElement;
    const value: string = element.value;
    (Constants as any)[prop] = () => eval(value);
}

(document.querySelector("#reconfigure") as HTMLButtonElement).onclick = function () {
    bind_property_to_setting("agent-creation-duration", "time_to_birth");
    bind_property_to_setting("agent-target-count", "lower_bound_count");
    bind_property_to_setting("agent-life-duration", "life_time");
    bind_property_to_setting("repopulate-interval", "repopulate_interval_time");
    bind_property_to_setting("log-interval", "log_interval_time");

    run_simulation(20);
};
