import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  className,
  triggerClassName,
  optionsClassName
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => 
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const displayLabel = selectedOption
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : placeholder;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-semibold text-foreground outline-none transition-all hover:bg-accent/50 focus:border-[#0099ff] focus:ring-1 focus:ring-[#0099ff]/50 font-sans",
          triggerClassName
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute left-0 right-0 z-50 mt-1.5 p-1 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto animate-in fade-in duration-100",
          optionsClassName
        )}>
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground font-sans">No options available</div>
          ) : (
            options.map((opt, i) => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const isSelected = optVal === value;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(optVal);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left text-foreground hover:bg-accent transition-colors font-sans font-medium",
                    isSelected && "bg-accent font-semibold"
                  )}
                >
                  <span className="truncate">{optLabel}</span>
                  {isSelected && <Check size={12} className="text-[#0099ff] shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
