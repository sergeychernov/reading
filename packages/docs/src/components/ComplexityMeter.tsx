import React from 'react';
import styles from './ComplexityMeter.module.css';

type ComplexityLevel = '*' | '**' | '***' | '****' | '*****' | '******';

interface ComplexityMeterProps {
  level: ComplexityLevel;
}

const LEVEL_TO_FILLED: Record<ComplexityLevel, number> = {
  '*': 1,
  '**': 2,
  '***': 3,
  '****': 4,
  '*****': 5,
  '******': 6,
};

/**
 * Visual complexity indicator with 6 bars, filled left to right.
 */
export default function ComplexityMeter({ level }: ComplexityMeterProps) {
  const filled = LEVEL_TO_FILLED[level];

  return (
    <span className={styles.wrap} title="complexity" aria-label="complexity">
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className={`${styles.cell} ${i < filled ? styles.filled : styles.empty}`}
        />
      ))}
    </span>
  );
}
