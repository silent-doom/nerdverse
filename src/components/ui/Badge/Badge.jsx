import styles from './Badge.module.css';

/**
 * Badge component for labels, categories, and status indicators.
 *
 * @param {Object} props
 * @param {'default'|'category'|'difficulty'|'status'|'new'} props.variant
 * @param {'sm'|'md'} props.size
 * @param {string} props.color - Custom CSS color override
 * @param {React.ReactNode} props.children
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  color,
  className = '',
  ...props
}) {
  const classNames = [
    styles.badge,
    styles[variant],
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  const style = color
    ? { '--badge-color': color, '--badge-bg': `${color}1a` }
    : undefined;

  return (
    <span className={classNames} style={style} {...props}>
      {children}
    </span>
  );
}
