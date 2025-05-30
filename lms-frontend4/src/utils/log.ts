export class Log {
  private static _log(level: string, ...args: unknown[]) {
    console.log(`[${level}]`, ...args);
  }
  static info(...args: unknown[]) {
    this._log("INFO", ...args);
  }

  static warn(...args: unknown[]) {
    this._log("WARN", ...args);
  }

  static error(...args: unknown[]) {
    this._log("ERROR", ...args);
  }
}
