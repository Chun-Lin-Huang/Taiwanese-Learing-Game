import { renderHook, act } from '@testing-library/react'
import { useIntersectionObserver } from '../useIntersectionObserver'
import { createMockIntersectionObserver } from '../../test/test-utils'

describe('useIntersectionObserver', () => {
  let mockObserver: any;
  let originalIntersectionObserver: any;

  beforeEach(() => {
    mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
    
    originalIntersectionObserver = global.IntersectionObserver;
    global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
      mockObserver.callback = callback;
      return mockObserver;
    });
  });

  afterEach(() => {
    global.IntersectionObserver = originalIntersectionObserver;
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.hasBeenSeen).toBe(false);
    expect(result.current.elementRef.current).toBe(null);
  });

  it('should observe element when ref is set', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    const mockElement = document.createElement('div');
    
    act(() => {
      result.current.elementRef.current = mockElement;
    });

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        threshold: 0.1,
        rootMargin: '50px'
      })
    );
    expect(mockObserver.observe).toHaveBeenCalledWith(mockElement);
  });

  it('should update state when intersection changes', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    const mockElement = document.createElement('div');
    
    act(() => {
      result.current.elementRef.current = mockElement;
    });

    // 模擬元素進入視窗
    act(() => {
      mockObserver.callback([{
        target: mockElement,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: new DOMRect(),
        intersectionRect: new DOMRect(),
        rootBounds: null,
        time: Date.now(),
      }]);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(result.current.hasBeenSeen).toBe(true);
  });

  it('should maintain hasBeenSeen as true once set', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    const mockElement = document.createElement('div');
    
    act(() => {
      result.current.elementRef.current = mockElement;
    });

    // 元素進入視窗
    act(() => {
      mockObserver.callback([{
        target: mockElement,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: new DOMRect(),
        intersectionRect: new DOMRect(),
        rootBounds: null,
        time: Date.now(),
      }]);
    });

    expect(result.current.hasBeenSeen).toBe(true);

    // 元素離開視窗
    act(() => {
      mockObserver.callback([{
        target: mockElement,
        isIntersecting: false,
        intersectionRatio: 0,
        boundingClientRect: new DOMRect(),
        intersectionRect: new DOMRect(),
        rootBounds: null,
        time: Date.now(),
      }]);
    });

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.hasBeenSeen).toBe(true); // 應該保持為 true
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() => useIntersectionObserver());

    unmount();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  it('should accept custom options', () => {
    const customOptions = {
      threshold: 0.5,
      rootMargin: '100px'
    };

    renderHook(() => useIntersectionObserver(customOptions));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining(customOptions)
    );
  });
});
