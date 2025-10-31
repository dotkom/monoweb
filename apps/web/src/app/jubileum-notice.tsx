"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Text } from '@dotkomonline/ui';
import { differenceInDays, intervalToDuration } from 'date-fns';

const getTimeDiff = ((startDate: string | Date, endDate: string | Date) => {

  const duration = intervalToDuration({ start: startDate, end: endDate });

  const days = differenceInDays(endDate, startDate);

  return `${(days < 10 ? `0${days}` : `${days}`)}d ${Number(duration.hours) < 10 ? `0${duration.hours}` : `${duration.hours}`}t ${Number(duration.minutes) < 10 ? `0${duration.minutes}` : `${duration.minutes}`}m ${Number(duration.seconds) < 10 ? `0${duration.seconds}` : `${duration.seconds}`}s`;
})

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
    <div className='bg-black rounded-2xl h-40'>
        <div className="relative h-full bg-[linear-gradient(rgba(255,255,255,0.1)_50%,transparent_50%)] bg-[length:10%_10px] animate-scan rounded-2xl" />

        <Link href="https://jub.online.ntnu.no/" target="_blank" rel="noopener noreferrer"
        className="flex flex-col justify-center items-center animate-flicker -mt-40 z-50 h-full"
        >
            <Text
            className={`font-glass text-white text-2xl lg:text-4xl z-50`}
            >
            Online Jubileum
            </Text>
            <Text
            className={`font-glass text-white text-2xl lg:text-4xl z-50`} suppressHydrationWarning={true}
            >
            {timeLeft}
            </Text>
        </Link>
    </div>
  );
}
