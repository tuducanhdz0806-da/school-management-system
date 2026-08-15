'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function QrScanner({
  onScanSuccess,
  active,
}: {
  onScanSuccess: (decodedText: string) => void;
  active: boolean;
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader-container';
  const [error, setError] = useState('');

  useEffect(() => {
    if (!active) return;

    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' }, // ưu tiên camera sau (điện thoại)
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        () => {
          // lỗi từng frame không tìm thấy QR — bỏ qua, không cần báo lỗi liên tục
        },
      )
      .catch((err) => {
        setError('Không thể truy cập camera. Vui lòng cấp quyền camera cho trình duyệt.');
        console.error(err);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, [active, onScanSuccess]);

  return (
    <div>
      <div id={containerId} className="rounded-lg overflow-hidden" />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}