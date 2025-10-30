"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Text } from '@dotkomonline/ui';

export function getTimeDiff(
  startDate: string | Date,
  endDate: string | Date
) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let diffMs = Math.abs(end.getTime() - start.getTime());

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs %= 1000 * 60 * 60 * 24;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs %= 1000 * 60 * 60;

  
  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs %= 1000 * 60;
  
  const seconds = Math.floor(diffMs / 1000);

  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return {
    days,
    hours: formattedHours,
    minutes: formattedMinutes,
    seconds: formattedSeconds,
  };
}

export default function JubNotice() {
  const [now, setNow] = useState(new Date());
  const targetDate = new Date(2026, 1, 16);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  const timeLeft = getTimeDiff(now, targetDate);

  return (
    <div className='bg-black rounded-2xl h-30'>
        <div className="relative h-full bg-[linear-gradient(rgba(255,255,255,0.1)_50%,transparent_50%)] bg-[length:10%_10px] animate-scan" />

        <Link href="https://jub.online.ntnu.no/" target="_blank" rel="noopener noreferrer"
        className="flex justify-center items-center animate-flicker -mt-30 z-50 h-30"
        >
            <Text
            className={`font-glass text-white text-2xl lg:text-4xl z-50`} suppressHydrationWarning={true}
            >
            {timeLeft.days}d {timeLeft.hours}t {timeLeft.minutes}m {timeLeft.seconds}s
            </Text>
        </Link>
    </div>
  );
}
