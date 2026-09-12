import { useEffect, useState } from 'react';

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getDecimalPlaces = (value) => {
  const fraction = String(value).split('.')[1];
  return fraction ? Math.min(fraction.length, 6) : 0;
};

const roundTo = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * Animates a numeric value from zero while preserving the caller's formatting.
 * The animation only restarts when its numeric target changes.
 */
export default function CountUp({
  value,
  duration = 800,
  decimals,
  prefix = '',
  suffix = '',
  formatter,
}) {
  const target = toFiniteNumber(value);
  const precision = Number.isFinite(Number(decimals))
    ? Math.max(0, Math.min(6, Math.floor(Number(decimals))))
    : getDecimalPlaces(target);
  const durationMs = Number.isFinite(Number(duration)) ? Math.max(0, Number(duration)) : 800;
  const [displayValue, setDisplayValue] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || durationMs === 0 || target === 0) {
      setDisplayValue(target);
      return undefined;
    }

    let frameId;
    let startTime;
    setDisplayValue(0);

    const animate = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      setDisplayValue(target * easedProgress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    frameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frameId);
  }, [durationMs, prefersReducedMotion, target]);

  const formattedValue = formatter
    ? formatter(roundTo(displayValue, precision))
    : new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(roundTo(displayValue, precision));

  return (
    <span>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
