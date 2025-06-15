import React, { useState } from 'react';

/**
 * TabGroup Component - A reusable tabbed interface component
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with label and icon properties
 * @param {Array} props.children - Array of React elements/components to display as tab content
 * @param {string} props.activeTabColor - Color for active tab (default: islamic-green)
 * @param {string} props.inactiveTabColor - Color for inactive tab (default: gray-500)
 * @param {string} props.className - Additional CSS classes
 */
const TabGroup = ({ 
    tabs = [], 
    children = [],
    activeTabColor = 'islamic-green',
    inactiveTabColor = 'gray-500',
    className = ''
}) => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    
    return (
        <div className={`w-full ${className}`}>
            {/* Tab Headers */}
            <div className="flex overflow-x-auto scrollbar-hide mb-6 border-b border-gray-200">
                {tabs.map((tab, index) => (
                    <button 
                        key={index}
                        onClick={() => setActiveTabIndex(index)}
                        className={`
                            flex items-center px-4 py-3 whitespace-nowrap font-medium text-sm transition-all duration-200
                            ${index === activeTabIndex 
                                ? `text-${activeTabColor} border-b-2 border-${activeTabColor}` 
                                : `text-${inactiveTabColor} hover:text-${activeTabColor}/80`
                            }
                        `}
                    >
                        {tab.icon && (
                            <span className="mr-2">
                                {tab.icon}
                            </span>
                        )}
                        {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Tab Content */}
            <div className="transition-opacity duration-300">
                {children[activeTabIndex]}
            </div>
        </div>
    );
};

export default TabGroup;
