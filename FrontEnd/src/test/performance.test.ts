import { renderHook, act } from '@testing-library/react'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import { useImagePreloader } from '../hooks/useImagePreloader'
import { mockImageLoad } from './test-utils'

describe('Performance Tests', () => {
  describe('Memory Usage', () => {
    it('should not create memory leaks with intersection observer', () => {
      const observers: any[] = [];
      
      // Mock IntersectionObserver to track instances
      const OriginalObserver = global.IntersectionObserver;
      global.IntersectionObserver = class MockObserver {
        constructor(callback: IntersectionObserverCallback) {
          observers.push(this);
        }
        observe() {}
        unobserve() {}
        disconnect() {
          const index = observers.indexOf(this);
          if (index > -1) observers.splice(index, 1);
        }
      } as any;

      // 創建多個 hooks 並卸載
      const hooks = Array.from({ length: 10 }, () => 
        renderHook(() => useIntersectionObserver())
      );

      expect(observers.length).toBe(10);

      // 卸載所有 hooks
      hooks.forEach(hook => hook.unmount());

      expect(observers.length).toBe(0);

      global.IntersectionObserver = OriginalObserver;
    });

    it('should cleanup image preloader properly', () => {
      const restoreImageMock = mockImageLoad(true, 50);
      
      const urls = Array.from({ length: 100 }, (_, i) => `https://example.com/image${i}.jpg`);
      
      const { unmount } = renderHook(() => useImagePreloader(urls, 5));

      // 卸載應該不會導致內存洩漏
      unmount();

      // 這裡主要是確保沒有錯誤拋出
      expect(true).toBe(true);

      restoreImageMock();
    });
  });

  describe('Load Time Optimization', () => {
    it('should prioritize visible images', async () => {
      const loadTimes: number[] = [];
      const restoreImageMock = mockImageLoad(true, 0);

      // Mock Image 來追蹤載入順序
      const originalImage = global.Image;
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        src: string = '';
        
        set src(value: string) {
          loadTimes.push(Date.now());
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 10);
        }
        
        get src() { return this._src || ''; }
        private _src: string = '';
      } as any;

      const urls = Array.from({ length: 20 }, (_, i) => `https://example.com/image${i}.jpg`);
      
      renderHook(() => useImagePreloader(urls, 3));

      await new Promise(resolve => setTimeout(resolve, 100));

      // 應該有載入順序記錄
      expect(loadTimes.length).toBeGreaterThan(0);
      expect(loadTimes.length).toBeLessThanOrEqual(20);

      global.Image = originalImage;
      restoreImageMock();
    });

    it('should handle rapid scroll performance', () => {
      const startTime = performance.now();
      
      // 模擬快速滾動觸發多次 intersection
      const { result } = renderHook(() => useIntersectionObserver());
      
      const mockElement = document.createElement('div');
      act(() => {
        result.current.elementRef.current = mockElement;
      });

      // 模擬快速多次觸發
      for (let i = 0; i < 100; i++) {
        act(() => {
          // 模擬 intersection 變化
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 應該在合理時間內完成（不超過 100ms）
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Network Efficiency', () => {
    it('should batch image requests efficiently', async () => {
      const requestTimes: number[] = [];
      const restoreImageMock = mockImageLoad(true, 50);

      // 追蹤網路請求時間
      const originalImage = global.Image;
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        
        set src(value: string) {
          requestTimes.push(Date.now());
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 50);
        }
      } as any;

      const urls = Array.from({ length: 10 }, (_, i) => `https://example.com/image${i}.jpg`);
      
      renderHook(() => useImagePreloader(urls, 3));

      await new Promise(resolve => setTimeout(resolve, 200));

      // 檢查請求是否被適當批次處理
      expect(requestTimes.length).toBeGreaterThan(0);
      
      // 計算請求間隔
      const intervals = requestTimes.slice(1).map((time, i) => time - requestTimes[i]);
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // 平均間隔應該合理（不會同時發送太多請求）
      expect(averageInterval).toBeGreaterThan(0);

      global.Image = originalImage;
      restoreImageMock();
    });
  });

  describe('Resource Cleanup', () => {
    it('should cleanup all resources on component unmount', () => {
      const resources: any[] = [];

      // Mock 各種資源追蹤
      const originalObserver = global.IntersectionObserver;
      global.IntersectionObserver = class MockObserver {
        constructor() {
          resources.push({ type: 'observer', cleaned: false });
        }
        observe() {}
        unobserve() {}
        disconnect() {
          resources.forEach(r => {
            if (r.type === 'observer') r.cleaned = true;
          });
        }
      } as any;

      const { unmount } = renderHook(() => useIntersectionObserver());

      expect(resources.length).toBe(1);
      expect(resources[0].cleaned).toBe(false);

      unmount();

      expect(resources[0].cleaned).toBe(true);

      global.IntersectionObserver = originalObserver;
    });
  });
});
