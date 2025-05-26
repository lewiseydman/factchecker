import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, HelpCircle, AlertCircle } from 'lucide-react';

interface TooltipConfig {
  title: string;
  content: string;
  type: 'info' | 'help' | 'warning' | 'explanation';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  maxWidth?: number;
}

interface DynamicTooltipProps {
  config: TooltipConfig;
  children: React.ReactNode;
  trigger?: 'hover' | 'click' | 'focus';
  disabled?: boolean;
}

const DynamicTooltip: React.FC<DynamicTooltipProps> = ({
  config,
  children,
  trigger = 'hover',
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let finalPosition = config.position || 'auto';
    let x = 0;
    let y = 0;

    // Auto-positioning logic
    if (finalPosition === 'auto') {
      const spaceTop = triggerRect.top;
      const spaceBottom = viewport.height - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewport.width - triggerRect.right;

      if (spaceTop >= tooltipRect.height + 10) {
        finalPosition = 'top';
      } else if (spaceBottom >= tooltipRect.height + 10) {
        finalPosition = 'bottom';
      } else if (spaceRight >= tooltipRect.width + 10) {
        finalPosition = 'right';
      } else if (spaceLeft >= tooltipRect.width + 10) {
        finalPosition = 'left';
      } else {
        finalPosition = 'bottom'; // fallback
      }
    }

    // Calculate position based on final position
    switch (finalPosition) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.top - tooltipRect.height - 10;
        break;
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.bottom + 10;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 10;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
      case 'right':
        x = triggerRect.right + 10;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
    }

    // Ensure tooltip stays within viewport
    x = Math.max(10, Math.min(x, viewport.width - tooltipRect.width - 10));
    y = Math.max(10, Math.min(y, viewport.height - tooltipRect.height - 10));

    setPosition({ x, y });
    setActualPosition(finalPosition);
  };

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const delay = config.delay || (trigger === 'hover' ? 500 : 0);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position after next render
      requestAnimationFrame(calculatePosition);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleTriggerEvent = (event: React.MouseEvent | React.FocusEvent) => {
    event.preventDefault();
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      
      const handleResize = () => calculatePosition();
      const handleScroll = () => hideTooltip();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trigger === 'click' && 
          tooltipRef.current && 
          triggerRef.current &&
          !tooltipRef.current.contains(event.target as Node) &&
          !triggerRef.current.contains(event.target as Node)) {
        hideTooltip();
      }
    };

    if (isVisible && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, trigger]);

  const getIcon = () => {
    switch (config.type) {
      case 'help':
        return <HelpCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
      case 'explanation':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeStyles = () => {
    switch (config.type) {
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100';
      case 'help':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100';
      case 'explanation':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100';
      case 'info':
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100';
    }
  };

  const getArrowStyles = () => {
    const baseArrow = 'absolute w-3 h-3 transform rotate-45';
    const typeColor = config.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                     config.type === 'help' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                     config.type === 'explanation' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' :
                     'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600';

    switch (actualPosition) {
      case 'top':
        return `${baseArrow} ${typeColor} bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r`;
      case 'bottom':
        return `${baseArrow} ${typeColor} top-[-6px] left-1/2 -translate-x-1/2 border-t border-l`;
      case 'left':
        return `${baseArrow} ${typeColor} right-[-6px] top-1/2 -translate-y-1/2 border-r border-b`;
      case 'right':
        return `${baseArrow} ${typeColor} left-[-6px] top-1/2 -translate-y-1/2 border-l border-t`;
      default:
        return `${baseArrow} ${typeColor} bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r`;
    }
  };

  const triggerProps = trigger === 'hover' ? {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
  } : trigger === 'focus' ? {
    onFocus: showTooltip,
    onBlur: hideTooltip,
  } : {
    onClick: handleTriggerEvent,
  };

  const tooltip = isVisible && (
    <div
      ref={tooltipRef}
      className={`fixed z-50 px-3 py-2 text-body-small rounded-lg border shadow-lg transition-opacity duration-200 ${getTypeStyles()}`}
      style={{
        left: position.x,
        top: position.y,
        maxWidth: config.maxWidth || 300,
        minWidth: 200,
      }}
    >
      <div className={getArrowStyles()} />
      
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          {config.title && (
            <div className="font-semibold text-body-small mb-1">
              {config.title}
            </div>
          )}
          <div className="text-caption leading-relaxed">
            {config.content}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        {...triggerProps}
      >
        {children}
      </div>
      {tooltip && createPortal(tooltip, document.body)}
    </>
  );
};

export default DynamicTooltip;