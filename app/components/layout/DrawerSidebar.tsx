import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from '~/components/ui/IconButton';

interface DrawerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const DrawerSidebar: React.FC<DrawerSidebarProps> = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-bolt-elements-background-depth-1 border-r border-bolt-elements-borderColor z-50 md:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-bolt-elements-borderColor">
              <span className="font-bold text-lg">Menu</span>
              <IconButton icon="i-ph:x" onClick={onClose} />
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
