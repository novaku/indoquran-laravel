import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button Component - Reusable button dengan berbagai variants
 * 
 * @example
 * // Primary button
 * <Button variant="primary" onClick={handleClick}>
 *   Save
 * </Button>
 * 
 * @example
 * // Secondary button
 * <Button variant="secondary" size="sm">
 *   Cancel
 * </Button>
 * 
 * @example
 * // Loading state
 * <Button variant="primary" loading>
 *   Processing...
 * </Button>
 */
const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  rounded = 'full',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  ...props 
}) => {
  // Variant classes
  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 border-transparent',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
    outline: 'bg-transparent text-green-600 hover:bg-green-50 border-green-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
    success: 'bg-green-600 text-white hover:bg-green-700 border-transparent',
  };

  // Size classes
  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  // Rounded classes
  const roundedClasses = {
    none: '',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  // Base classes
  const baseClasses = 'font-medium border transition-colors duration-200 inline-flex items-center justify-center gap-2';
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Disabled/loading classes
  const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    widthClass,
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && leftIcon && <span>{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'full']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
