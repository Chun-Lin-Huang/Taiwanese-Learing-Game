import React, { useRef, useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';
import './QRScanner.css';

interface QRScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError?: (error: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ 
  onScanSuccess, 
  onScanError, 
  onClose, 
  isVisible 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isVisible]);

  const startScanner = async () => {
    try {
      if (!videoRef.current) return;

      // 檢查相機權限
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setHasPermission(false);
        onScanError?.('未檢測到相機設備');
        return;
      }

      // 創建 QR 掃描器實例
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code 掃描成功:', result.data);
          onScanSuccess(result.data);
          stopScanner();
          onClose();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // 使用後置相機
        }
      );

      // 開始掃描
      await qrScannerRef.current.start();
      setIsScanning(true);
      setHasPermission(true);
      
    } catch (error: any) {
      console.error('QR 掃描器啟動失敗:', error);
      setHasPermission(false);
      onScanError?.(error.message || '相機權限被拒絕');
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-modal">
        <div className="qr-scanner-header">
          <h3>QR Code 掃描器</h3>
          <button className="qr-scanner-close" onClick={handleClose}>
            ✕
          </button>
        </div>
        
        <div className="qr-scanner-content">
          {hasPermission === false ? (
            <div className="qr-scanner-error">
              <p>無法訪問相機</p>
              <p>請檢查相機權限設置</p>
              <button onClick={handleClose} className="qr-scanner-btn">
                關閉
              </button>
            </div>
          ) : (
            <>
              <div className="qr-scanner-video-container">
                <video 
                  ref={videoRef} 
                  className="qr-scanner-video"
                  playsInline
                />
                <div className="qr-scanner-overlay-frame">
                  <div className="qr-scanner-corner tl"></div>
                  <div className="qr-scanner-corner tr"></div>
                  <div className="qr-scanner-corner bl"></div>
                  <div className="qr-scanner-corner br"></div>
                </div>
              </div>
              <div className="qr-scanner-instructions">
                <p>將 QR Code 對準掃描框</p>
                {isScanning && <p className="scanning-indicator">掃描中...</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
