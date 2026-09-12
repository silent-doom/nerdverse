import styles from './Card.module.css';

/**
 * Card component with glassmorphic styling and optional hover glow.
 *
 * @param {Object} props
 * @param {'default'|'interactive'|'elevated'|'outline'} props.variant
 * @param {'sm'|'md'|'lg'} props.padding
 * @param {boolean} props.glow - Enable glow effect on hover
 * @param {React.ReactNode} props.children
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  glow = false,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`] || styles[`pad-${padding}`],
    glow ? styles.glow : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classNames} {...props}>
      {children}
    </Component>
  );
}
