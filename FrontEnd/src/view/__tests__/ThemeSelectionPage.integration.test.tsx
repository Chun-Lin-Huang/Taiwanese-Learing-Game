import React from 'react'
import { render, screen, waitFor, fireEvent } from '../../test/test-utils'
import ThemeSelectionPage from '../ThemeSelectionPage'
import { mockImageLoad, createMockIntersectionObserver, mockNetworkConnection } from '../../test/test-utils'
import * as fetchUtils from '../../utils/fetch'

// Mock API response
const mockCategories = [
  {
    _id: '1',
    name: '交通工具',
    imageUrl: 'https://example.com/transport.jpg'
  },
  {
    _id: '2', 
    name: '動物與昆蟲',
    imageUrl: 'https://example.com/animals.jpg'
  },
  {
    _id: '3',
    name: '飲食與食物',
    imageUrl: 'https://example.com/food.jpg'
  }
];

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch utility
jest.mock('../../utils/fetch', () => ({
  asyncGet: jest.fn()
}));

describe('ThemeSelectionPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchUtils.asyncGet as jest.Mock).mockResolvedValue({
      body: mockCategories
    });
  });

  it('should load and display categories with lazy images', async () => {
    const restoreImageMock = mockImageLoad(true, 100);
    global.IntersectionObserver = createMockIntersectionObserver(true, 50);

    render(<ThemeSelectionPage />);

    // 等待 API 載入完成
    await waitFor(() => {
      expect(screen.queryByText('讀取主題清單失敗')).not.toBeInTheDocument();
    });

    // 檢查類別是否正確顯示
    await waitFor(() => {
      expect(screen.getByText('交通工具')).toBeInTheDocument();
      expect(screen.getByText('動物與昆蟲')).toBeInTheDocument();
      expect(screen.getByText('飲食與食物')).toBeInTheDocument();
    });

    // 檢查圖片是否懶載入
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/transport.jpg');
    });

    restoreImageMock();
  });

  it('should show loading state initially', () => {
    // 延遲 API 回應
    (fetchUtils.asyncGet as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ body: mockCategories }), 1000))
    );

    render(<ThemeSelectionPage />);

    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('should handle API error gracefully', async () => {
    (fetchUtils.asyncGet as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ThemeSelectionPage />);

    await waitFor(() => {
      expect(screen.getByText('讀取主題清單失敗')).toBeInTheDocument();
    });
  });

  it('should navigate to vocabulary overview on card click', async () => {
    const restoreImageMock = mockImageLoad(true, 50);
    global.IntersectionObserver = createMockIntersectionObserver(true, 25);

    render(<ThemeSelectionPage />);

    await waitFor(() => {
      expect(screen.getByText('交通工具')).toBeInTheDocument();
    });

    const transportCard = screen.getByText('交通工具').closest('.card');
    expect(transportCard).toBeInTheDocument();

    fireEvent.click(transportCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/VocabularyOverview/1', {
      state: {
        categoryName: '交通工具',
        categoryId: '1'
      }
    });

    restoreImageMock();
  });

  it('should optimize for slow network connections', async () => {
    const restoreConnection = mockNetworkConnection('2g');
    const restoreImageMock = mockImageLoad(true, 200);
    global.IntersectionObserver = createMockIntersectionObserver(true, 100);

    render(<ThemeSelectionPage />);

    await waitFor(() => {
      expect(screen.getByText('交通工具')).toBeInTheDocument();
    });

    // 在慢速連接下，應該有適當的載入指示
    await waitFor(() => {
      const skeletonLoaders = screen.getAllByTestId('skeleton-loader');
      expect(skeletonLoaders.length).toBeGreaterThan(0);
    });

    restoreConnection();
    restoreImageMock();
  });

  it('should handle image load failures with fallback', async () => {
    const restoreImageMock = mockImageLoad(false, 100);
    global.IntersectionObserver = createMockIntersectionObserver(true, 50);

    render(<ThemeSelectionPage />);

    await waitFor(() => {
      expect(screen.getByText('交通工具')).toBeInTheDocument();
    });

    // 等待圖片載入失敗並顯示 fallback
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('src', expect.stringContaining('fallback'));
      });
    });

    restoreImageMock();
  });

  it('should only load images when they become visible', async () => {
    const restoreImageMock = mockImageLoad(true, 50);
    
    // 模擬只有第一張圖片可見
    let callCount = 0;
    global.IntersectionObserver = class MockIntersectionObserver {
      constructor(private callback: IntersectionObserverCallback) {}
      
      observe(target: Element) {
        setTimeout(() => {
          this.callback([{
            target,
            isIntersecting: callCount === 0, // 只有第一個元素可見
            intersectionRatio: callCount === 0 ? 1 : 0,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: callCount === 0 ? target.getBoundingClientRect() : new DOMRect(),
            rootBounds: null,
            time: Date.now(),
          }] as IntersectionObserverEntry[], this);
          callCount++;
        }, 25);
      }
      
      unobserve() {}
      disconnect() {}
    };

    render(<ThemeSelectionPage />);

    await waitFor(() => {
      expect(screen.getByText('交通工具')).toBeInTheDocument();
    });

    // 只應該載入可見的圖片
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeLessThanOrEqual(1);
    });

    restoreImageMock();
  });

  it('should handle keyboard navigation', async () => {
    const restoreImageMock = mockImageLoad(true, 50);
    global.IntersectionObserver = createMockIntersectionObserver(true, 25);

    render(<ThemeSelectionPage />);

    await waitFor(() => {
      expect(screen.getByText('交通工具')).toBeInTheDocument();
    });

    const container = screen.getByTestId('theme-selection-container');
    
    // 測試鍵盤導航
    fireEvent.keyDown(container, { key: 'ArrowRight' });
    fireEvent.keyDown(container, { key: 'Enter' });

    // 應該導航到下一個項目
    expect(mockNavigate).toHaveBeenCalled();

    restoreImageMock();
  });
});
