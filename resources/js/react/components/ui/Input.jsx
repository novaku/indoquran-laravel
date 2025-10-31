import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input Component - Reusable input fields dengan styling konsisten
 * 
 * @example
 * // Basic text input
 * <Input 
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 * 
 * @example
 * // Input with error
 * <Input 
 *   label="Password"
 *   type="password"
 *   error="Password is required"
 * />
 * 
 * @example
 * // Textarea
 * <Input 
 *   as="textarea"
 *   label="Message"
 *   rows={4}
 * />
 */
const Input = forwardRef(({ 
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  as = 'input',
  leftIcon,
  rightIcon,
  ...props 
}, ref) => {
  const Component = as;

  // Base input classes
  const baseClasses = 'w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors';
  
  // Error classes
  const errorClasses = error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200';
  
  // Icon padding
  const iconPaddingLeft = leftIcon ? 'pl-10' : '';
  const iconPaddingRight = rightIcon ? 'pr-10' : '';

  // Combine input classes
  const inputClasses = [
    baseClasses,
    errorClasses,
    iconPaddingLeft,
    iconPaddingRight,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <Component
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  as: PropTypes.oneOf(['input', 'textarea']),
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  required: PropTypes.bool,
};

/**
 * Select Component - Dropdown select dengan styling konsisten
 */
export const Select = forwardRef(({ 
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  options = [],
  children,
  ...props 
}, ref) => {
  const baseClasses = 'w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors';
  const errorClasses = error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200';
  
  const selectClasses = [baseClasses, errorClasses, className].filter(Boolean).join(' ');

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        className={selectClasses}
        {...props}
      >
        {children || options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  children: PropTypes.node,
  required: PropTypes.bool,
};

export default Input;
