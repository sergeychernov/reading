import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  status: string;
  label?: string;
}

/**
 * Universal colored badge.
 *
 * Usage in MDX:
 *   <Badge status="backlog" />
 *   <Badge status="high" />
 */
export default function Badge({ status, label }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status] ?? ''}`}>
      {label ?? status}
    </span>
  );
}
