import React from 'react';
import PropTypes from 'prop-types';

/**
 * Container Component - Page container dengan max-width konsisten
 * 
 * @example
 * // Default container
 * <Container>
 *   <h1>Page Content</h1>
 * </Container>
 * 
 * @example
 * // Wide container
 * <Container size="lg">
 *   <div>Wide content</div>
 * </Container>
 * 
 * @example
 * // No padding
 * <Container noPadding>
 *   <div>Full width content</div>
 * </Container>
 */
const Container = ({ 
  children, 
  className = '',
  size = 'md',
  noPadding = false,
  centerContent = false,
  ...props 
}) => {
  // Size variants (max-width)
  const sizeClasses = {
    sm: 'max-w-2xl',   // ~672px - For narrow content like forms
    md: 'max-w-4xl',   // ~896px - Default, good for most content
    lg: 'max-w-6xl',   // ~1152px - Wider content
    xl: 'max-w-7xl',   // ~1280px - Very wide layouts
    full: 'max-w-full', // Full width
  };

  // Padding classes
  const paddingClasses = noPadding ? '' : 'px-4 py-8';

  // Center content
  const centerClasses = centerContent ? 'flex items-center justify-center min-h-screen' : '';

  // Base classes
  const baseClasses = 'mx-auto w-full';

  // Combine all classes
  const containerClasses = [
    baseClasses,
    sizeClasses[size],
    paddingClasses,
    centerClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  noPadding: PropTypes.bool,
  centerContent: PropTypes.bool,
};

/**
 * PageHeader Component - Consistent page header dengan border
 */
export const PageHeader = ({ 
  title, 
  subtitle,
  icon,
  action,
  className = '',
  ...props 
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`} {...props}>
      <Container size="md" className="py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && <div className="text-green-600">{icon}</div>}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      </Container>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
};

/**
 * PageContent Component - Main content area dengan background
 */
export const PageContent = ({ 
  children, 
  className = '',
  size = 'md',
  ...props 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Container size={size} className={className} {...props}>
        {children}
      </Container>
    </div>
  );
};

PageContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
};

export default Container;
