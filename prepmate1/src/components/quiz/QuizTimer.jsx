import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

export default function QuizTimer({ totalSeconds, onTimeUp, isPaused }) {
  const [time, setTime] = useState(totalSeconds || 0);
  const timerRef = useRef(null);
  const isCountDown = totalSeconds > 0;

  useEffect(() => {
    // Reset when totalSeconds change from props (e.g. restart)
    if (totalSeconds !== null && totalSeconds !== undefined) {
       setTime(isCountDown ? totalSeconds : 0);
    }
  }, [totalSeconds, isCountDown]);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (isCountDown) {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prevTime - 1;
        } else {
          return prevTime + 1;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCountDown, isPaused, onTimeUp]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = isCountDown && time > 0 && time <= 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-lg font-bold transition-colors ${
      isLowTime 
        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-timer-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
        : 'bg-white/[0.05] border-white/[0.1] text-gray-200'
    }`}>
      <Clock className={`w-5 h-5 ${isLowTime ? 'text-rose-400' : 'text-gray-400'}`} />
      {formatTime(time)}
    </div>
  );
}
