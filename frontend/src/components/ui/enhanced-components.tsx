import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Button amélioré avec support du mode sombre
interface EnhancedButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function EnhancedButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button'
}: EnhancedButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm hover:shadow-md focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white shadow-sm hover:shadow-md focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white shadow-sm hover:shadow-md focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-black dark:text-yellow-900 shadow-sm hover:shadow-md focus:ring-yellow-500',
    ghost: 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      type={type}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Card améliorée avec support du mode sombre
interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  elevated?: boolean;
  onClick?: () => void;
}

export function EnhancedCard({ 
  children, 
  className = '', 
  hover = false, 
  elevated = false,
  onClick 
}: EnhancedCardProps) {
  const baseClasses = 'bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700/50 rounded-xl transition-all duration-200 backdrop-blur-sm';
  const hoverClasses = hover ? 'hover:shadow-md dark:hover:shadow-enhanced hover:scale-[1.01] cursor-pointer' : '';
  const elevatedClasses = elevated ? 'shadow-lg dark:shadow-enhanced-lg' : 'shadow-sm';
  
  return (
    <div 
      className={cn(baseClasses, hoverClasses, elevatedClasses, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Input amélioré avec support du mode sombre
interface EnhancedInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  name?: string;
}

export function EnhancedInput({ 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  error = false,
  id,
  name
}: EnhancedInputProps) {
  const baseClasses = 'w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400';
  const normalClasses = 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500';
  const errorClasses = 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500';
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn(baseClasses, error ? errorClasses : normalClasses, className)}
      disabled={disabled}
      id={id}
      name={name}
    />
  );
}

// Textarea amélioré avec support du mode sombre
interface EnhancedTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  rows?: number;
  id?: string;
  name?: string;
}

export function EnhancedTextarea({ 
  placeholder = '', 
  value, 
  onChange, 
  className = '', 
  disabled = false,
  error = false,
  rows = 3,
  id,
  name
}: EnhancedTextareaProps) {
  const baseClasses = 'w-full px-3 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed resize-vertical bg-white dark:bg-slate-900/50 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400';
  const normalClasses = 'border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500';
  const errorClasses = 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500';
  
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn(baseClasses, error ? errorClasses : normalClasses, className)}
      disabled={disabled}
      rows={rows}
      id={id}
      name={name}
    />
  );
}

// Badge amélioré avec support du mode sombre
interface EnhancedBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function EnhancedBadge({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '' 
}: EnhancedBadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };
  
  return (
    <span className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
}

// Loader amélioré avec support du mode sombre
interface EnhancedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EnhancedLoader({ size = 'md', className = '' }: EnhancedLoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400', sizeClasses[size], className)}></div>
  );
}

// Divider amélioré avec support du mode sombre
interface EnhancedDividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function EnhancedDivider({ orientation = 'horizontal', className = '' }: EnhancedDividerProps) {
  const baseClasses = 'border-gray-200 dark:border-slate-700/50';
  const orientationClasses = orientation === 'horizontal' ? 'border-t w-full' : 'border-l h-full';
  
  return <div className={cn(baseClasses, orientationClasses, className)} />;
}