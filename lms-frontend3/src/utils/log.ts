export class Log {
  private static _log(level: string, ...args: any[]) {
    console.log(`[${level}]`, ...args);
  }
  static info(...args: any[]) {
    this._log("INFO", ...args);
  }

  static warn(...args: any[]) {
    this._log("WARN", ...args);
  }

  static error(...args: any[]) {
    this._log("ERROR", ...args);
  }
}
