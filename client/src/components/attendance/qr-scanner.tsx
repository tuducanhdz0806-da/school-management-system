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
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.75;
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
        },
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
      <div id={containerId} className="rounded-lg overflow-hidden w-full [&_video]:!w-full [&_video]:!h-auto [&_video]:!min-h-[400px] [&_video]:!object-cover" />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}