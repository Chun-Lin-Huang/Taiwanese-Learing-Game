import { renderHook } from '@testing-library/react'
import { useNetworkStatus } from '../useNetworkStatus'
import { mockNetworkConnection } from '../../test/test-utils'

describe('useNetworkStatus', () => {
  it('should detect fast connection by default', () => {
    const restoreConnection = mockNetworkConnection('4g');
    
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isSlowConnection).toBe(false);
    expect(result.current.effectiveType).toBe('4g');

    restoreConnection();
  });

  it('should detect slow 2g connection', () => {
    const restoreConnection = mockNetworkConnection('slow-2g');
    
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isSlowConnection).toBe(true);
    expect(result.current.effectiveType).toBe('slow-2g');

    restoreConnection();
  });

  it('should detect 2g connection as slow', () => {
    const restoreConnection = mockNetworkConnection('2g');
    
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isSlowConnection).toBe(true);
    expect(result.current.effectiveType).toBe('2g');

    restoreConnection();
  });

  it('should detect 3g connection as fast', () => {
    const restoreConnection = mockNetworkConnection('3g');
    
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isSlowConnection).toBe(false);
    expect(result.current.effectiveType).toBe('3g');

    restoreConnection();
  });

  it('should handle missing connection API', () => {
    const originalConnection = (navigator as any).connection;
    
    // 移除 connection API
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: undefined
    });

    const { result } = renderHook(() => useNetworkStatus());

    // 當沒有 connection API 時，應該假設為快速連接
    expect(result.current.isSlowConnection).toBe(false);
    expect(result.current.effectiveType).toBe('unknown');

    // 恢復原始值
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: originalConnection
    });
  });

  it('should provide download speed information', () => {
    const restoreConnection = mockNetworkConnection('4g');
    
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.downlink).toBe(10);
    expect(result.current.rtt).toBe(50);

    restoreConnection();
  });
});
