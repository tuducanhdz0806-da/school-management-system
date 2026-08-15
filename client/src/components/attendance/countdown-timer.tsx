'use client';

import { useEffect, useState } from 'react';

export function CountdownTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    function tick() {
      const remaining = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        onExpire();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft <= 30;

  return (
    <div
      className={`text-4xl font-bold tabular-nums ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}
    >
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}