import { useEffect, useRef } from "react";

export function useEffectOnUpdate<T>(callback: () => void, deps: T[]) {
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
