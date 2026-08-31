'use client';

import { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useNow } from '@/context/Now';
import { ShardInfo } from '@/lib/shard';
import { DateTime } from 'luxon';

// Helper function to calculate total hours, minutes, and seconds remaining
function getHoursCountdown(target: DateTime, now: DateTime): string {
  if (target < now) return '00:00:00';
  
  // Omit 'weeks' and 'days' to force Luxon to roll them down into total hours
  const diff = target.diff(now, ['hours', 'minutes', 'seconds']);
  
  const hours = Math.floor(diff.hours).toString().padStart(2, '0');
  const minutes = Math.floor(diff.minutes).toString().padStart(2, '0');
  const seconds = Math.floor(diff.seconds).toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

export function ShardCountdownSection({ info }: { info: ShardInfo }) {
  const { t } = useTranslation(['countdownSection', 'durationFmts']);
  const { application: now } = useNow();
  const { occurrences } = info;
  
  const upcommingIndex = occurrences.findIndex(({ end }) => end > now);
  const upcomming = upcommingIndex >= 0 ? occurrences[upcommingIndex] : undefined;
  const landed = upcomming && upcomming.land < now;
  const countdownTo = upcomming && landed ? occurrences[upcommingIndex]?.end : upcomming?.land;

  // Live ticking state for the hours countdown
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    if (!countdownTo) return;

    // Set initial layout right away
    setDisplayTime(getHoursCountdown(countdownTo, DateTime.now()));

    // Tick every second
    const interval = setInterval(() => {
      setDisplayTime(getHoursCountdown(countdownTo, DateTime.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownTo]);

  if (!upcomming) {
    return (
      <div className='w-full text-center p-2 text-sm font-medium text-white/90 font-mono'>
        <Trans
          t={t}
          tOptions={{ transWrapTextNodes: 'p' }}
          i18nKey='allEnded'
          components={{ 
            bold: <span className='font-bold' />, 
            // Fallback string rendering if info.lastEnd is provided
            countdown: <span>{info.lastEnd ? getHoursCountdown(info.lastEnd, now) : ''}</span> 
          }}
        />
      </div>
    );
  }

  const landedSinceStr = now.diff(upcomming.land, 'seconds').toFormat(t('durationFmts:hm'));

  return (
    <div className="w-full flex flex-col items-center justify-center text-center space-y-4 py-2 select-none">
      {/* 1. Header State Message */}
      <div className="text-xs font-medium tracking-wide text-orange-100/90 bg-black/10 rounded-xl px-4 py-1.5 backdrop-blur-xs">
        {landed ? (
          <span>First shard landed <strong className="text-white font-bold">{landedSinceStr}</strong> ago</span>
        ) : (
          <span>Shard Block 0{upcommingIndex + 1} Falling Soon</span>
        )}
      </div>

      {/* 2. Isolated Timer Label */}
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-mono text-orange-200 uppercase tracking-widest font-bold mb-1 block">
          {landed ? 'Ending In' : 'Landing In'}
        </span>
        <div className="bg-white/10 px-6 py-2.5 rounded-2xl border border-white/10 shadow-inner font-mono text-2xl font-bold tracking-wider">
          {displayTime}
        </div>
      </div>
    </div>
  );
}

export default ShardCountdownSection;