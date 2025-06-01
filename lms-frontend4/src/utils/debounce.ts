export default function debounce(fn: (..._: any[]) => void, delay = 250) {
    let timeout: NodeJS.Timeout;

    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}
