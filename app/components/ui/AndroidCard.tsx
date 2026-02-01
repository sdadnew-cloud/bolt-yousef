import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';

interface AndroidCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  className?: string;
}

export const AndroidCard: React.FC<AndroidCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  onClick,
  hoverEffect = true,
  className = '',
}) => {
  const baseClasses =
    'bg-[#121212] rounded-lg border border-[#212121] overflow-hidden shadow-md transition-all duration-200';

  return (
    <motion.div
      onClick={onClick}
      className={classNames(
        baseClasses,
        hoverEffect && onClick ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '',
        className,
      )}
      whileHover={hoverEffect && onClick ? { scale: 1.01 } : {}}
      whileTap={hoverEffect && onClick ? { scale: 0.99 } : {}}
    >
      {title && (
        <div className="px-4 py-3 border-b border-[#212121] flex items-center gap-2">
          {icon && <i className={icon} style={{ color: '#1E88E5', fontSize: '1.25rem' }}></i>}
          <div>
            {title && <h3 className="font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-[#B3B3B3]">{subtitle}</p>}
          </div>
        </div>
      )}

      <div className="p-4">{children}</div>
    </motion.div>
  );
};
