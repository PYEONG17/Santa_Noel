import React, { useState, useEffect } from 'react';

const Countdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const year = new Date().getFullYear();
      let christmasDate = new Date(year, 11, 25).getTime(); // Month is 0-indexed (11 is Dec)
      const now = new Date().getTime();

      // If Christmas passed this year, count to next year
      if (now > christmasDate) {
        christmasDate = new Date(year + 1, 11, 25).getTime();
      }

      const difference = christmasDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial call

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center shadow-lg transform hover:scale-105 transition-transform duration-300">
      <h3 className="text-xl font-christmas text-red-400 mb-2">Đếm Ngược Giáng Sinh</h3>
      <div className="flex justify-center gap-4 text-white">
        <div className="flex flex-col">
          <span className="text-3xl font-bold font-mono">{timeLeft.days}</span>
          <span className="text-xs uppercase tracking-wider text-gray-300">Ngày</span>
        </div>
        <div className="text-2xl font-bold self-start mt-1">:</div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold font-mono">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-xs uppercase tracking-wider text-gray-300">Giờ</span>
        </div>
        <div className="text-2xl font-bold self-start mt-1">:</div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold font-mono">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-xs uppercase tracking-wider text-gray-300">Phút</span>
        </div>
        <div className="text-2xl font-bold self-start mt-1">:</div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold font-mono">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-xs uppercase tracking-wider text-gray-300">Giây</span>
        </div>
      </div>
    </div>
  );
};

export default Countdown;