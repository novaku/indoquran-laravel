import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card Component - Reusable card container dengan desain konsisten
 * 
 * @example
 * // Basic card
 * <Card>
 *   <h3>Title</h3>
 *   <p>Content</p>
 * </Card>
 * 
 * @example
 * // Hoverable card
 * <Card hoverable onClick={handleClick}>
 *   Interactive content
 * </Card>
 * 
 * @example
 * // Custom padding
 * <Card padding="lg">
 *   More spacious content
 * </Card>
 */
const Card = ({ 
  children, 
  className = '', 
  hoverable = false,
  noPadding = false,
  padding = 'md',
  rounded = 'xl',
  shadow = 'sm',
  onClick,
  ...props 
}) => {
  // Padding variants
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  // Rounded variants
  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-2xl',
    full: 'rounded-full'
  };

  // Shadow variants
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  // Base classes
  const baseClasses = 'bg-white border border-gray-200';
  
  // Hover classes
  const hoverClasses = hoverable 
    ? 'hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer' 
    : '';

  // Combine all classes
  const cardClasses = [
    baseClasses,
    noPadding ? '' : paddingClasses[padding],
    roundedClasses[rounded],
    shadowClasses[shadow],
    hoverClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hoverable: PropTypes.bool,
  noPadding: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  rounded: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  shadow: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  onClick: PropTypes.func,
};

export default Card;
