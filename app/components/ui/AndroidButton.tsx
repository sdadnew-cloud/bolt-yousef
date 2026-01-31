import React from 'react';
import { motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';

interface AndroidButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  icon?: string;
}

export const AndroidButton: React.FC<AndroidButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  icon,
}) => {
  const baseClasses = 'relative overflow-hidden rounded-lg transition-all duration-200 font-medium';
  
  const variantClasses = {
    primary: 'bg-[#1E88E5] text-white hover:bg-[#1976D2] active:bg-[#1565C0] shadow-md hover:shadow-lg',
    secondary: 'bg-[#42A5F5] text-white hover:bg-[#1E88E5] active:bg-[#1976D2] shadow-md hover:shadow-lg',
    outline: 'bg-transparent border-2 border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white active:bg-[#1976D2]',
    text: 'bg-transparent text-[#1E88E5] hover:bg-[#1E88E5]/10 active:bg-[#1E88E5]/20',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled ? disabledClasses : '',
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {icon && <i className={icon}></i>}
        {children}
      </div>
      
      {/* Ripple effect */}
      <span className="absolute inset-0 bg-white opacity-0 rounded-lg transform scale-0 transition-all duration-300" />
    </motion.button>
  );
};

// Usage examples:
// <AndroidButton onClick={() => console.log('Clicked')}>Primary Button</AndroidButton>
// <AndroidButton variant="secondary" size="large">Secondary Button</AndroidButton>
// <AndroidButton variant="outline" icon="i-ph:plus">Add Item</AndroidButton>
// <AndroidButton variant="text" size="small" disabled>Disabled Button</AndroidButton>
