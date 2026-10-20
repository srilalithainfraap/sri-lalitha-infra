import React from 'react';

const variants = {
  primary: 'bg-[#B88A35] hover:bg-[#D5B46B] text-white font-semibold shadow-md',
  secondary: 'bg-[#172544] hover:bg-[#101B35] text-white font-semibold shadow-md',
  outline: 'border-2 border-[#B88A35] text-[#B88A35] hover:bg-[#B88A35] hover:text-white font-semibold',
  ghost: 'text-[#B88A35] hover:bg-[#B88A35]/10 font-semibold',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
