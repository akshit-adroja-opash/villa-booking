'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, LucideIcon } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select option'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value.toLowerCase() === value.toLowerCase());
  const SelectedIcon = selectedOption?.icon;

  return (
    <div className="relative w-full" ref={containerRef} id={id}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border bg-[#f9fafb] px-4 py-3 text-sm text-[#1B2A22] outline-none transition-all cursor-pointer ${
          isOpen 
            ? 'border-[#00a877] bg-white' 
            : 'border-gray-200 hover:border-gray-300 focus:border-[#00a877] focus:bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {SelectedIcon && (
            <SelectedIcon className={`h-4 w-4 ${isOpen ? 'text-[#00a877]' : 'text-gray-500'}`} />
          )}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#00a877]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-gray-100 bg-white p-1 shadow-[0_10px_25px_rgba(0,0,0,0.06)] animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value.toLowerCase() === value.toLowerCase();
              const OptionIcon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left transition-all ${
                    isSelected
                      ? 'bg-[#00a877]/10 text-[#0b513d]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {OptionIcon && (
                      <OptionIcon className={`h-4 w-4 ${isSelected ? 'text-[#00a877]' : 'text-gray-500'}`} />
                    )}
                    <span className={`text-sm ${isSelected ? 'text-[#0b513d] font-semibold' : 'text-[#1B2A22]'}`}>
                      {option.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="rounded-full bg-[#00a877] p-0.5 text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
