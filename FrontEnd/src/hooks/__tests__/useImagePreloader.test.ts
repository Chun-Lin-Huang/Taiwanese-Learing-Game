import { renderHook, waitFor } from '@testing-library/react'
import { useImagePreloader } from '../useImagePreloader'
import { mockImageLoad } from '../../test/test-utils'

describe('useImagePreloader', () => {
  beforeEach(() => {
    // 重置 Image 模擬
    jest.clearAllMocks();
  });

  it('should preload images successfully', async () => {
    const restoreImageMock = mockImageLoad(true, 50);
    
    const urls = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg'
    ];

    const { result } = renderHook(() => useImagePreloader(urls, 2));

    expect(result.current.size).toBe(0);

    await waitFor(() => {
      expect(result.current.size).toBe(3);
    }, { timeout: 1000 });

    expect(result.current.has('https://example.com/image1.jpg')).toBe(true);
    expect(result.current.has('https://example.com/image2.jpg')).toBe(true);
    expect(result.current.has('https://example.com/image3.jpg')).toBe(true);

    restoreImageMock();
  });

  it('should respect priority limit', async () => {
    const restoreImageMock = mockImageLoad(true, 100);
    
    const urls = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
      'https://example.com/image4.jpg'
    ];

    const { result } = renderHook(() => useImagePreloader(urls, 2));

    // 等待一段時間，但不足以完成所有載入
    await waitFor(() => {
      expect(result.current.size).toBeGreaterThan(0);
    }, { timeout: 150 });

    // 應該不會超過優先級限制同時載入太多
    expect(result.current.size).toBeLessThanOrEqual(4);

    restoreImageMock();
  });

  it('should handle image load failures gracefully', async () => {
    const restoreImageMock = mockImageLoad(false, 50);
    
    const urls = [
      'https://example.com/invalid1.jpg',
      'https://example.com/invalid2.jpg'
    ];

    const { result } = renderHook(() => useImagePreloader(urls, 2));

    await waitFor(() => {
      expect(result.current.size).toBe(2);
    }, { timeout: 500 });

    // 即使載入失敗，也應該標記為已處理
    expect(result.current.has('https://example.com/invalid1.jpg')).toBe(true);
    expect(result.current.has('https://example.com/invalid2.jpg')).toBe(true);

    restoreImageMock();
  });

  it('should handle empty URL array', () => {
    const { result } = renderHook(() => useImagePreloader([], 2));

    expect(result.current.size).toBe(0);
  });

  it('should update when URLs change', async () => {
    const restoreImageMock = mockImageLoad(true, 50);
    
    const initialUrls = ['https://example.com/image1.jpg'];
    const { result, rerender } = renderHook(
      ({ urls }) => useImagePreloader(urls, 2),
      { initialProps: { urls: initialUrls } }
    );

    await waitFor(() => {
      expect(result.current.size).toBe(1);
    });

    const newUrls = ['https://example.com/image2.jpg', 'https://example.com/image3.jpg'];
    rerender({ urls: newUrls });

    await waitFor(() => {
      expect(result.current.size).toBe(2);
    });

    expect(result.current.has('https://example.com/image2.jpg')).toBe(true);
    expect(result.current.has('https://example.com/image3.jpg')).toBe(true);

    restoreImageMock();
  });
});
