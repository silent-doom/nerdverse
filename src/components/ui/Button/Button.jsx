'use client';

import styles from './Button.module.css';

/**
 * Button component with multiple variants, sizes, and states.
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'outline'} props.variant - Visual style
 * @param {'sm'|'md'|'lg'} props.size - Size of the button
 * @param {boolean} props.isLoading - Shows loading spinner
 * @param {boolean} props.fullWidth - Full width button
 * @param {React.ReactNode} props.leftIcon - Icon before text
 * @param {React.ReactNode} props.rightIcon - Icon after text
 * @param {React.ReactNode} props.children - Button content
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    isLoading ? styles.loading : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      <span className={styles.label}>{children}</span>
      {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  );
}
