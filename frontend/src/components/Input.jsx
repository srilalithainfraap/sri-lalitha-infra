import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({ label, error, className = '', type = 'text', ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-[#172544]">{label}</label>}
      <div className="relative">
        <input
          type={inputType}
          className={`w-full px-4 py-2.5 rounded-lg border text-base min-h-[44px] ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#B88A35]'
          } focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white text-[#101B35] transition`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#B88A35] transition"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', rows = 4, ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-[#172544]">{label}</label>}
      <textarea
        rows={rows}
        className={`w-full px-4 py-2.5 rounded-lg border text-base ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#B88A35]'
        } focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white text-[#101B35] transition resize-none`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium text-[#172544]">{label}</label>}
      <select
        className={`w-full px-4 py-2.5 rounded-lg border text-base min-h-[44px] ${
          error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-[#B88A35]'
        } focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white text-[#101B35] transition`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
