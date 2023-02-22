import { useAsyncEffect } from 'ahooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AsyncFn<T> = (...arg: any[]) => Promise<T>;

export function useAsyncValue<T>(fn: AsyncFn<T>, initialized?: T) {
  const [value, setValue] = useState<T>(initialized as T);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<Error>();
  const unMountedRef = useRef(false);

  useEffect(() => {
    return () => {
      unMountedRef.current = true;
    };
  }, []);

  useAsyncEffect(async () => {
    try {
      const value = await fn();
      if (unMountedRef.current) {
        return;
      }

      setValue(value);
    } catch (error) {
      setErr(error as Error);
    } finally {
      setLoading(false);
    }
  }, [fn]);

  const reload = useCallback(async () => {
    setLoading(true);
    setErr(undefined);
    try {
      const value = await fn();
      if (unMountedRef.current) {
        return;
      }

      setValue(value);
    } catch (error) {
      setErr(error as Error);
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return useMemo(() => {
    return {
      value,
      loading,
      err,
      reload,
    };
  }, [err, loading, reload, value]);
}
