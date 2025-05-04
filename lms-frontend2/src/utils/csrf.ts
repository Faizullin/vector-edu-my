// utils/csrf.ts
export function getCSRFToken(): string | undefined {
    const csrfMatch = document.cookie.match(/csrftoken=([^;]+)/);
    return csrfMatch?.[1];
  }
  