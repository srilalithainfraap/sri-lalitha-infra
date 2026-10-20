import React from 'react';

const variants = {
  available: 'bg-[#B88A35]/20 text-[#8B6520] border border-[#B88A35]/40',
  reserved: 'bg-blue-100 text-blue-700 border border-blue-300',
  sold: 'bg-gray-100 text-gray-600 border border-gray-300',
  success: 'bg-green-100 text-green-700 border border-green-300',
  warning: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  info: 'bg-blue-50 text-blue-600 border border-blue-200',
  default: 'bg-gray-100 text-gray-600 border border-gray-300',
};

export function Badge({ variant = 'default', className = '', children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
