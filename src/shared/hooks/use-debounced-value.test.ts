import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from './use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('só atualiza depois do intervalo sem mudanças', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'h' } },
    );

    await rerender({ value: 'he' });
    await act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('h');

    await act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('he');
  });

  it('reinicia a contagem a cada nova mudança', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'h' } },
    );

    await rerender({ value: 'he' });
    await act(() => jest.advanceTimersByTime(200));
    await rerender({ value: 'hel' });
    await act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('h');

    await act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('hel');
  });
});
