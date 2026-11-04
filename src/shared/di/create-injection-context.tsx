import { createContext, use, type PropsWithChildren } from 'react';

export function createInjectionContext<T>(name: string) {
  const Context = createContext<T | null>(null);

  function Provider({ value, children }: PropsWithChildren<{ value: T }>) {
    return <Context value={value}>{children}</Context>;
  }

  function useInjected(): T {
    const value = use(Context);

    if (value === null) {
      throw new Error(`${name} não foi fornecido. Verifique o composition root (src/di).`);
    }

    return value;
  }

  return [Provider, useInjected] as const;
}
