import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find selected option label
  const getSelectedLabel = () => {
    if (!value && value !== 0) return placeholder;
    const found = options.find(opt => 
      typeof opt === 'object' ? opt.value === value || String(opt.value) === String(value) : String(opt) === String(value)
    );
    if (!found) return placeholder;
    return typeof found === 'object' ? found.label : found;
  };

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue,
      },
    });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full font-sans" ref={containerRef}>
      {/* Hidden input for HTML form validation */}
      <input
        type="text"
        id={id}
        name={name}
        value={value || ''}
        required={required}
        onChange={() => {}}
        tabIndex={-1}
        className="sr-only"
      />

      {/* Select Trigger Button with balanced px-5 padding */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full h-[50px] px-5 py-3 bg-light-surface-secondary dark:bg-dark-surface-secondary border ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-light-border dark:border-dark-border'
        } rounded-field text-sm text-left text-light-foreground dark:text-dark-foreground focus:outline-none transition-all duration-200 flex items-center justify-between cursor-pointer`}
      >
        {/* Selected Value Text */}
        <span className={`truncate ${!value && value !== 0 ? 'text-light-muted dark:text-dark-muted' : 'font-medium'}`}>
          {getSelectedLabel()}
        </span>

        {/* Chevron Indicator */}
        <ChevronDown
          className={`w-4 h-4 text-light-muted dark:text-dark-muted shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu List */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-dropdown max-h-60 overflow-y-auto p-1.5 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-xl border border-light-border dark:border-dark-border rounded-field shadow-xl space-y-1 focus:outline-none custom-scrollbar"
          >
            {options.map((option, index) => {
              const optValue = typeof option === 'object' ? option.value : option;
              const optLabel = typeof option === 'object' ? option.label : option;
              const isSelected = String(value) === String(optValue);

              return (
                <li
                  key={index}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(optValue)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'text-light-foreground dark:text-dark-foreground hover:bg-light-surface-secondary dark:hover:bg-dark-surface-secondary'
                  }`}
                >
                  <span className="truncate">{optLabel}</span>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2 stroke-[2.5]" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
