import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * VirtualScrollList Component
 * Implements virtual scrolling for large lists to improve performance
 * Only renders visible items plus a buffer zone
 */
const VirtualScrollList = ({ 
  items = [],
  itemHeight = 100,
  containerHeight = 600,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  ...props 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      originalIndex: startIndex + index
    }));
  }, [items, visibleRange]);

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  // Offset for visible items
  const offsetY = visibleRange.startIndex * itemHeight;

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll(e);
    }
  }, [onScroll]);

  // Scroll to specific item
  const scrollToItem = useCallback((index) => {
    if (scrollElementRef.current) {
      const scrollTop = index * itemHeight;
      scrollElementRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  }, [itemHeight]);

  // Expose scroll methods
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollToItem = scrollToItem;
    }
  }, [scrollToItem]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={item.originalIndex}
              style={{ height: itemHeight }}
              className="virtual-list-item"
            >
              {renderItem(item, item.originalIndex)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * VirtualGrid Component
 * Implements virtual scrolling for grid layouts
 */
export const VirtualGrid = ({ 
  items = [],
  itemHeight = 200,
  itemsPerRow = 3,
  containerHeight = 600,
  renderItem,
  gap = 16,
  overscan = 2,
  className = '',
  onScroll,
  ...props 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef(null);

  // Calculate row height including gap
  const rowHeight = itemHeight + gap;

  // Total number of rows
  const totalRows = Math.ceil(items.length / itemsPerRow);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );
    
    return { startRow, endRow };
  }, [scrollTop, rowHeight, containerHeight, totalRows, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startRow, endRow } = visibleRange;
    const startIndex = startRow * itemsPerRow;
    const endIndex = Math.min(items.length - 1, (endRow + 1) * itemsPerRow - 1);
    
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      originalIndex: startIndex + index
    }));
  }, [items, visibleRange, itemsPerRow]);

  // Total height
  const totalHeight = totalRows * rowHeight;

  // Offset for visible items
  const offsetY = visibleRange.startRow * rowHeight;

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll(e);
    }
  }, [onScroll]);

  // Group visible items into rows
  const visibleRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < visibleItems.length; i += itemsPerRow) {
      rows.push(visibleItems.slice(i, i + itemsPerRow));
    }
    return rows;
  }, [visibleItems, itemsPerRow]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Total height container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleRows.map((row, rowIndex) => (
            <div
              key={visibleRange.startRow + rowIndex}
              className="flex"
              style={{ 
                height: itemHeight,
                marginBottom: gap,
                gap: gap
              }}
            >
              {row.map((item, itemIndex) => (
                <div
                  key={item.originalIndex}
                  style={{ flex: `1 1 ${100 / itemsPerRow}%` }}
                  className="virtual-grid-item"
                >
                  {renderItem(item, item.originalIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualScrollList;
