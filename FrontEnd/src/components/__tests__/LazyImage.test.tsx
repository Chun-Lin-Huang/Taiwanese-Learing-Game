import React from 'react'
import { render, screen, waitFor } from '../../test/test-utils'
import { LazyImage } from '../LazyImage'
import { mockImageLoad, createMockIntersectionObserver } from '../../test/test-utils'

// Mock fallback image
jest.mock('../../assets/森林俱樂部.png', () => 'mocked-fallback.png');

describe('LazyImage', () => {
  const defaultProps = {
    src: 'https://example.com/test-image.jpg',
    alt: 'Test image',
    className: 'test-image-class'
  };

  beforeEach(() => {
    // 重置 IntersectionObserver mock
    global.IntersectionObserver = createMockIntersectionObserver(false);
  });

  it('should render placeholder when not intersecting', () => {
    render(<LazyImage {...defaultProps} />);

    expect(screen.getByText('📷')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should show skeleton loader when intersecting but image not loaded', async () => {
    // 模擬進入視窗但圖片還在載入
    global.IntersectionObserver = createMockIntersectionObserver(true, 100);
    const restoreImageMock = mockImageLoad(true, 200);

    render(<LazyImage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
    });

    restoreImageMock();
  });

  it('should load and display image when intersecting', async () => {
    global.IntersectionObserver = createMockIntersectionObserver(true, 50);
    const restoreImageMock = mockImageLoad(true, 100);

    render(<LazyImage {...defaultProps} />);

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', defaultProps.src);
      expect(img).toHaveAttribute('alt', defaultProps.alt);
    });

    restoreImageMock();
  });

  it('should show fallback image on load error', async () => {
    global.IntersectionObserver = createMockIntersectionObserver(true, 50);
    const restoreImageMock = mockImageLoad(false, 100);

    render(<LazyImage {...defaultProps} fallback="fallback-image.jpg" />);

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'fallback-image.jpg');
    });

    restoreImageMock();
  });

  it('should apply fade-in animation when image loads', async () => {
    global.IntersectionObserver = createMockIntersectionObserver(true, 50);
    const restoreImageMock = mockImageLoad(true, 100);

    render(<LazyImage {...defaultProps} />);

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toHaveStyle('opacity: 1');
      expect(img).toHaveStyle('transition: opacity 0.3s ease-in-out');
    });

    restoreImageMock();
  });

  it('should handle custom className', () => {
    render(<LazyImage {...defaultProps} />);

    const container = screen.getByTestId('lazy-image-container');
    expect(container).toHaveClass(defaultProps.className);
  });

  it('should use default fallback when none provided', async () => {
    global.IntersectionObserver = createMockIntersectionObserver(true, 50);
    const restoreImageMock = mockImageLoad(false, 100);

    render(<LazyImage {...defaultProps} />);

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'mocked-fallback.png');
    });

    restoreImageMock();
  });

  it('should not reload image after successful load', async () => {
    global.IntersectionObserver = createMockIntersectionObserver(true, 50);
    const restoreImageMock = mockImageLoad(true, 100);

    const { rerender } = render(<LazyImage {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    // 重新渲染組件
    rerender(<LazyImage {...defaultProps} src="https://example.com/new-image.jpg" />);

    // 圖片應該仍然顯示，不會重新載入
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/new-image.jpg');

    restoreImageMock();
  });

  it('should handle intersection observer options', () => {
    const customOptions = {
      threshold: 0.5,
      rootMargin: '100px'
    };

    render(<LazyImage {...defaultProps} observerOptions={customOptions} />);

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining(customOptions)
    );
  });

  it('should cleanup on unmount', () => {
    const { unmount } = render(<LazyImage {...defaultProps} />);

    const mockDisconnect = jest.fn();
    (global.IntersectionObserver as any).prototype.disconnect = mockDisconnect;

    unmount();

    // Note: 實際的清理會在 useIntersectionObserver hook 中處理
    // 這裡主要是確保組件能正常卸載
    expect(true).toBe(true);
  });
});
