'use client';

import { useState, useCallback } from 'react';
import { QrScanner } from '@/components/attendance/qr-scanner';
import { useCheckIn } from '@/hooks/use-checkin';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Camera } from 'lucide-react';

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

export default function StudentAttendancePage() {
  const [state, setState] = useState<ScanState>('idle');
  const [message, setMessage] = useState('');
  const checkIn = useCheckIn();

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      // Tránh gọi API nhiều lần nếu camera quét trùng nhiều frame liên tiếp
      if (checkIn.isPending || state === 'success') return;

      try {
        await checkIn.mutateAsync(decodedText);
        setState('success');
        setMessage('Điểm danh thành công!');
      } catch (err: any) {
        setState('error');
        setMessage(err.response?.data?.message || 'Điểm danh thất bại');
      }
    },
    [checkIn, state],
  );

  function handleRetry() {
    setState('scanning');
    setMessage('');
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Điểm danh QR</h1>
      <p className="text-gray-500 mb-6">Quét mã QR do giáo viên cung cấp để điểm danh</p>

      <div className="rounded-lg border bg-white p-4 sm:p-6">
        {state === 'idle' && (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500 mb-4">
              Bấm nút bên dưới để mở camera và quét mã QR
            </p>
            <Button onClick={() => setState('scanning')}>Mở camera</Button>
          </div>
        )}

        {state === 'scanning' && (
          <QrScanner active={true} onScanSuccess={handleScanSuccess} />
        )}

        {state === 'success' && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-14 w-14 mx-auto text-green-500 mb-3" />
            <p className="font-medium text-green-700">{message}</p>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-8">
            <XCircle className="h-14 w-14 mx-auto text-red-500 mb-3" />
            <p className="font-medium text-red-700 mb-4">{message}</p>
            <Button variant="outline" onClick={handleRetry}>
              Thử lại
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}