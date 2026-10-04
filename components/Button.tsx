
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "font-mono uppercase tracking-wider border-2 transition-all duration-100 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-lg"
  };

  const variants = {
    primary: "bg-amber-600 border-amber-500 text-black hover:bg-amber-500 font-bold",
    secondary: "bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-500",
    danger: "bg-red-900 border-red-700 text-red-100 hover:bg-red-800",
    ghost: "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200"
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
