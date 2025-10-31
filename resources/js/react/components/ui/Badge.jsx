import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component - Small label untuk status, categories, tags
 * 
 * @example
 * // Basic badge
 * <Badge>New</Badge>
 * 
 * @example
 * // Colored badge
 * <Badge variant="success">Active</Badge>
 * 
 * @example
 * // Outline badge
 * <Badge variant="primary" outline>Featured</Badge>
 */
const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  outline = false,
  rounded = 'full',
  className = '',
  ...props 
}) => {
  // Variant classes
  const variantClasses = {
    default: outline 
      ? 'bg-white text-gray-700 border-gray-300' 
      : 'bg-gray-100 text-gray-800 border-gray-100',
    primary: outline 
      ? 'bg-white text-green-700 border-green-300' 
      : 'bg-green-100 text-green-800 border-green-100',
    success: outline 
      ? 'bg-white text-green-700 border-green-300' 
      : 'bg-green-100 text-green-800 border-green-100',
    warning: outline 
      ? 'bg-white text-yellow-700 border-yellow-300' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-100',
    danger: outline 
      ? 'bg-white text-red-700 border-red-300' 
      : 'bg-red-100 text-red-800 border-red-100',
    info: outline 
      ? 'bg-white text-blue-700 border-blue-300' 
      : 'bg-blue-100 text-blue-800 border-blue-100',
    purple: outline 
      ? 'bg-white text-purple-700 border-purple-300' 
      : 'bg-purple-100 text-purple-800 border-purple-100',
    orange: outline 
      ? 'bg-white text-orange-700 border-orange-300' 
      : 'bg-orange-100 text-orange-800 border-orange-100',
  };

  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  // Rounded classes
  const roundedClasses = {
    none: '',
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium border';

  // Combine all classes
  const badgeClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info', 'purple', 'orange']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  outline: PropTypes.bool,
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'full']),
  className: PropTypes.string,
};

/**
 * IconBadge Component - Badge dengan icon
 */
export const IconBadge = ({ 
  icon,
  children,
  variant = 'default',
  size = 'md',
  ...props 
}) => {
  return (
    <Badge variant={variant} size={size} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </Badge>
  );
};

IconBadge.propTypes = {
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info', 'purple', 'orange']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
};

/**
 * DotBadge Component - Simple dot indicator
 */
export const DotBadge = ({ 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const colorClasses = {
    default: 'bg-gray-400',
    primary: 'bg-green-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const dotClasses = [
    'rounded-full inline-block',
    colorClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return <span className={dotClasses} {...props} />;
};

DotBadge.propTypes = {
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Badge;
