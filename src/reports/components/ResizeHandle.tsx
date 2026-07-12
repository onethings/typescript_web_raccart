/**
 * 可拖曳大小調整手柄元件
 *
 * 用於報表頁面拖曳調整地圖/表格的垂直分割比例。
 * 對應 FRONTME.md 8.3 ResizeHandle 章節。
 */

import React, { useCallback, useRef, useEffect } from 'react';

interface ResizeHandleProps {
  /** 方向 */
  direction?: 'horizontal' | 'vertical';
  /** 拖曳回呼：回傳比例 (0-1) */
  onResize?: (ratio: number) => void;
}

/**
 * 可拖曳大小調整手柄
 * 水平或垂直拖曳調整容器大小
 */
export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction = 'vertical',
  onResize,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startPos.current = direction === 'vertical' ? e.clientY : e.clientX;

      const parent = containerRef.current?.parentElement;
      if (parent) {
        startSize.current = direction === 'vertical'
          ? parent.getBoundingClientRect().height
          : parent.getBoundingClientRect().width;
      }

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [direction],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;
      const parent = containerRef.current?.parentElement;
      if (!parent) return;

      const currentPos = direction === 'vertical' ? e.clientY : e.clientX;
      const delta = currentPos - startPos.current;
      const parentSize = direction === 'vertical'
        ? parent.getBoundingClientRect().height
        : parent.getBoundingClientRect().width;

      const ratio = Math.max(0.1, Math.min(0.9, (startSize.current + delta) / parentSize));
      onResize?.(ratio);
    },
    [direction, onResize],
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        [direction === 'vertical' ? 'height' : 'width']: 8,
        [direction === 'vertical' ? 'width' : 'height']: '100%',
        cursor: direction === 'vertical' ? 'row-resize' : 'col-resize',
        backgroundColor: 'transparent',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: 'absolute',
          [direction === 'vertical' ? 'top' : 'left']: '50%',
          [direction === 'vertical' ? 'left' : 'top']: '50%',
          transform: 'translate(-50%, -50%)',
          [direction === 'vertical' ? 'width' : 'height']: 30,
          [direction === 'vertical' ? 'height' : 'width']: 3,
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.15)',
        }}
      />
    </div>
  );
};
