import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ label, options, value, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && <label className="text-sm font-bold text-foreground ml-1">{label}</label>}
      
      <div className="relative group">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between pl-12 pr-4 py-3.5 bg-surface-secondary border rounded-field transition-all outline-none text-left ${
            isOpen ? 'border-accent ring-2 ring-accent/20' : 'border-border hover:border-accent/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-foreground font-medium">{selectedOption.label}</span>
          </div>
          <ChevronDown 
            size={20} 
            className={`text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`} 
          />
        </button>

        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-accent' : 'text-muted'}`}>
            <Icon size={20} />
          </div>
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-[100] mt-2 w-full bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    value === option.value 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-foreground hover:bg-surface-secondary hover:text-accent'
                  }`}
                >
                  {option.label}
                  {value === option.value && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
