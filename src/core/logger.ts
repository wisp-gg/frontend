function getTimestamp() {
    return new Date().toISOString();
}

class Logger {
    static info(title: string, ...args: any[]): void {
        console.info(`${getTimestamp()} [${title}/INFO]`, ...args);
    }

    static debug(title: string, ...args: any[]): void {
        if (window.Wisp?.Debug) {
            console.debug(`${getTimestamp()} [${title}/DEBUG]`, ...args);
        }
    }

    static warn(title: string, ...args: any[]): void {
        console.warn(`${getTimestamp()} [${title}/WARN]`, ...args);
    }

    static error(title: string, ...args: any[]): void {
        console.error(`${getTimestamp()} [${title}/ERROR]`, ...args);
    }

    static fatal(title: string, ...args: any[]): void {
        console.error(`${getTimestamp()} [${title}/FATAL]`, ...args);

        alert('Something went really wrong - unable to recover. Refer to the console output for more information.');
    }
}

export default Logger;
