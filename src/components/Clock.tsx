'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTime, Duration, Settings as LuxonSettings } from 'luxon';
import { useNow } from '../context/Now';
import { useSettings } from '../context/Settings';

interface ClockProp {
  time?: DateTime;
  duration?: Duration;
  dualUnit?: boolean;
  convertTo?: 'local' | 'sky';
  className?: string;
  relFontSize?: number;
  disableMonoFont?: boolean;
  disableSeconds?: boolean;
  strikeThrough?: boolean;
}

export function StaticClock({
  time,
  duration,
  dualUnit,
  convertTo,
  className = '',
  relFontSize = 1,
  disableMonoFont,
  disableSeconds,
  strikeThrough,
}: ClockProp) {
  const { t } = useTranslation('durationFmts');
  const { twelveHourMode } = useSettings();
  
  // Track component mounting state to safely bypass server mismatches
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!duration && !time) throw new Error('Time component requires either time or duration prop');
  if (time && duration) throw new Error('Time component requires either time or duration prop, not both');
  if (time && time.locale !== LuxonSettings.defaultLocale) {
    time = time.setLocale(LuxonSettings.defaultLocale);
  }

  const formattedTime = duration
    ? duration.toFormat(
        t(
          disableSeconds || dualUnit
            ? Math.abs(duration.as('minutes')) > 90
              ? 'hm'
              : disableSeconds
                ? 'm'
                : 'ms'
            : 'hms',
        ),
      )
    : time?.setZone(convertTo === 'local' ? 'default' : 'America/Los_Angeles')?.toLocaleString({
        hourCycle: twelveHourMode === 'system' ? undefined : twelveHourMode === 'true' ? 'h12' : 'h23',
        hour: '2-digit',
        minute: '2-digit',
        second: disableSeconds || dualUnit ? undefined : '2-digit',
      });

  className += disableMonoFont ? '' : ' font-mono';
  if (strikeThrough) className += ' line-through';

  return (
    <span className={className} style={relFontSize ? { fontSize: `${relFontSize}em` } : undefined}>
      {/* If not mounted yet, render an invisible placeholder matching layout dimensions */}
      {mounted ? (
        formattedTime
      ) : (
        <span className="opacity-0 select-none">
          {disableSeconds || dualUnit ? '00:00 AM' : '00:00:00 AM'}
        </span>
      )}
    </span>
  );
}

export default StaticClock;

type ClockNowProp = Omit<ClockProp, 'convertTo' | 'duration' | 'strikeThrough'> & {
  showLocal?: boolean;
  invertDiff?: boolean;
  strikeThroughPast?: boolean;
};

export function ClockNow({ time, showLocal = false, invertDiff, strikeThroughPast, ...clockParam }: ClockNowProp) {
  const { application, local } = useNow();
  if (time && strikeThroughPast) {
    return (
      <StaticClock
        strikeThrough={application > time}
        {...clockParam}
        time={time}
        convertTo={showLocal ? 'local' : 'sky'}
      />
    );
  } else if (time && !strikeThroughPast) {
    const duration = invertDiff ? application.diff(time) : time.diff(application);
    return <StaticClock {...clockParam} duration={duration} />;
  } else {
    const now = showLocal ? local : application;
    return <StaticClock {...clockParam} time={now} />;
  }
}

interface CountdownProp {
  to: DateTime;
  minimal?: boolean;
}

export function Countdown({ to, minimal = false }: CountdownProp) {
  const { application: now } = useNow();
  const { t } = useTranslation('durationUnits');
  
  // FIX: Track mounting state inside the Countdown too to stop the sidebar crash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  let duration = now.diff(to).shiftTo('hours', 'minutes', 'seconds', 'milliseconds');
  const isNegative = duration.as('seconds') < 0;
  if (isNegative) duration = duration.negate();
  const { hours, minutes, seconds } = duration;

  const days = hours > 60 ? Math.floor(hours / 24) : undefined;

  const pad = (num: number) => String(Math.floor(num)).padStart(2, '0');

  if (minimal) {
    return (
      <span className="font-mono tracking-widest font-black text-3xl md:text-4xl text-white drop-shadow-sm">
        {/* Render a safe layout skeleton during initial SSR execution */}
        {mounted ? (
          <>
            {days ? `${pad(days)}:` : ''}{pad(hours % 24)}:{pad(minutes)}:{pad(seconds)}
          </>
        ) : (
          <span className="opacity-0 select-none">
            {days ? '00:' : ''}00:00:00
          </span>
        )}
      </span>
    );
  }

  return (
    <div className='my-0.5 grid auto-cols-fr grid-flow-col grid-rows-[auto,auto] justify-center justify-items-center gap-x-2 px-2'>
      {mounted ? (
        <>
          {days && (
            <CountdownParts
              value={days}
              unitShort={t('days.short', { count: days })}
              unitLong={t('days.long', { count: days })}
            />
          )}
          <CountdownParts
            value={days ? hours % 24 : hours}
            unitShort={t('hours.short', { count: hours })}
            unitLong={t('hours.long', { count: hours })}
          />
          <CountdownParts
            value={minutes}
            unitShort={t('minutes.short', { count: minutes })}
            unitLong={t('minutes.long', { count: minutes })}
          />
          <CountdownParts
            value={seconds}
            unitShort={t('seconds.short', { count: seconds })}
            unitLong={t('seconds.long', { count: seconds })}
          />
        </>
      ) : (
        <>
          {days && <CountdownParts value={0} unitShort="..." unitLong="..." />}
          <CountdownParts value={0} unitShort="..." unitLong="..." />
          <CountdownParts value={0} unitShort="..." unitLong="..." />
          <CountdownParts value={0} unitShort="..." unitLong="..." />
        </>
      )}
    </div>
  );
}

export function CountdownParts({
  value,
  unitShort,
  unitLong,
}: {
  value: number;
  unitShort?: string;
  unitLong?: string;
}) {
  const valueStr = value.toString().padStart(2, '0');
  return (
    <>
      <span className='font-mono text-[1.2em] font-bold leading-[.8em] md:text-[1.8em] md:leading-[1em]'>
        {valueStr}
      </span>
      <span className='text-[0.8em] opacity-60 md:hidden'>{unitShort}</span>
      <span className=' text-[1em] opacity-60 max-md:hidden'>{unitLong}</span>
    </>
  );
}