/**
 * Модуль инициализации env-переменных
 * @remark Если не найдено значение хоть одной переменной,
 * Приложение сразу выбросит ошибку, при инициализации модуля
 * @module
 */

/**
 * Получение env-переменной
 * @throwable
 */
 const getEnvVar = (key: string) => {
    if (import.meta.env[key] === undefined) {
        throw new Error(`Env variable ${key} is required`);
    }
    return import.meta.env[key] || "";
};

/** API entrypoint */
export const API_URL = getEnvVar("VITE_REACT_APP_API_URL");

/** Режим запуска программы */
export const NODE_ENV = getEnvVar("VITE_NODE_ENV");
/** Режим разработки */
export const isDevEnv = NODE_ENV === "development";
/** Режим продакшена */
export const isProdEnv = NODE_ENV === "production";
