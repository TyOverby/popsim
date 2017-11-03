import simulate from './sim';
import { Chart } from 'chart.js';
import config from './constants';

const canvas = document.querySelector("canvas");
let chart: Chart | null = null;

function run_simulation(timespan: number) {
    const labels: string[] = [];
    const idle_values: number[] = [];
    const use_values: number[] = [];
    const in_flight: number[] = [];

    simulate(timespan, (t, idle, in_use, flight) => {
        labels.push(t.toFixed(2));
        idle_values.push(idle);
        use_values.push(in_use);
        in_flight.push(flight);
    });

    if (chart !== null) { chart.destroy() }

    const stackedElement = document.querySelector("#stacked") as HTMLInputElement;
    const stackGraphs = stackedElement.checked;

    chart = new Chart(canvas as HTMLCanvasElement, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'idle',
                data: idle_values,
                lineTension: 0,
                backgroundColor: 'rgba(132, 99, 255, 0.5)',
                borderColor: 'rgba(0,0,100,1)',
                borderWidth: 2
            }, {
                label: 'in use',
                data: use_values,
                lineTension: 0,
                backgroundColor: 'rgba(99, 255, 132, 0.5)',
                borderColor: 'rgba(40,140,70,1)',
                borderWidth: 2
            }, {
                hidden: true,
                label: 'being created',
                data: in_flight,
                lineTension: 0,
                backgroundColor: 'rgba(255, 80, 132, 0.1)',
                borderColor: 'rgba(140,40,70,0.4)',
                borderWidth: 2
            }
            ]
        },
        options: {
            animation: { duration: 0 },
            elements: { point: { radius: 0.0 } },
            responsive: false,
            scales: {
                xAxes: [{
                    gridLines: { display: false },
                    stacked: stackGraphs,
                }],
                yAxes: [{
                    stacked: stackGraphs
                }]
            }
        }
    });
}



(document.querySelector("#reconfigure") as HTMLButtonElement).onclick = function () {
    const simDuration: number = config('simulation-duration');
    run_simulation(simDuration);
};
