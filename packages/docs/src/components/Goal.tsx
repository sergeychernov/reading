import React from 'react';
import styles from './Goal.module.css';

interface GoalProps {
	children: React.ReactNode;
}

/**
 * Inline goal callout for milestones.
 *
 * Usage in MDX or via swizzled DocItem/Content:
 *   <Goal>Make engineering and releases repeatable</Goal>
 */
export default function Goal({ children }: GoalProps) {
	if (!children) return null;

	return (
		<div className={styles.goal}>
			<span className={styles.label}>Goal</span>
			<span className={styles.text}>{children}</span>
		</div>
	);
}
