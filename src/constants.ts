export const pm = (x: number) => (Math.random() - 0.5) * 2 * x;

export default function config(id: string): any {
    const element = document.querySelector("#" + id) as HTMLInputElement;
    let value: string;

    if (element.type === "text") {
        value = element.value;
    } else {
        value = "" + element.checked;
    }


    return eval(value);
}
