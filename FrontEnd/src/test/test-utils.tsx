import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// 自定義渲染函數，包含路由
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// 測試工具函數
export const createMockIntersectionObserver = (
  isIntersecting = true,
  delay = 0
) => {
  return class MockIntersectionObserver {
    constructor(
      private callback: IntersectionObserverCallback,
      private options?: IntersectionObserverInit
    ) {}

    observe(target: Element) {
      setTimeout(() => {
        this.callback([
          {
            target,
            isIntersecting,
            intersectionRatio: isIntersecting ? 1 : 0,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: isIntersecting ? target.getBoundingClientRect() : new DOMRect(),
            rootBounds: null,
            time: Date.now(),
          }
        ] as IntersectionObserverEntry[], this);
      }, delay);
    }

    unobserve() {}
    disconnect() {}
  }
}

// 模擬圖片載入
export const mockImageLoad = (shouldSucceed = true, delay = 100) => {
  const originalImage = global.Image;
  
  global.Image = class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src: string = '';
    
    constructor() {
      setTimeout(() => {
        if (shouldSucceed && this.onload) {
          this.onload();
        } else if (!shouldSucceed && this.onerror) {
          this.onerror();
        }
      }, delay);
    }
  } as any;

  return () => {
    global.Image = originalImage;
  };
}

// 模擬網路狀態
export const mockNetworkConnection = (effectiveType: '2g' | '3g' | '4g' | 'slow-2g' = '4g') => {
  const originalConnection = (navigator as any).connection;
  
  Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: {
      effectiveType,
      downlink: effectiveType === '4g' ? 10 : 1,
      rtt: effectiveType === '4g' ? 50 : 300,
    }
  });

  return () => {
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: originalConnection
    });
  };
}

// 等待異步操作完成
export const waitForAsync = (ms = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

// 模擬滾動事件
export const mockScroll = (element: Element, scrollTop: number) => {
  Object.defineProperty(element, 'scrollTop', {
    writable: true,
    value: scrollTop,
  });
  element.dispatchEvent(new Event('scroll'));
};
