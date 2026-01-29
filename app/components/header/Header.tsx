import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { useTheme } from '~/contexts/ThemeContext';
import { themeStore } from '~/lib/stores/theme';
import { useStore as useNanostore } from '@nanostores/react';

export function Header() {
  const chat = useStore(chatStore);
  const { designScheme } = useTheme();
  const currentTheme = useNanostore(themeStore);

  return (
    <header
      className={classNames(
        'flex items-center px-4 border-b h-[var(--header-height)]',
        'bg-[var(--color-background)]',
        'border-[var(--color-border)]',
        'text-[var(--color-text)]',
        'transition-colors duration-300'
      )}
      style={{
        backgroundColor: designScheme.palette.background,
        color: designScheme.palette.text,
        borderColor: designScheme.palette.border
      }}
    >
      <div className="flex items-center gap-2 z-logo cursor-pointer" style={{ color: designScheme.palette.text }}>
        <div className="i-ph:sidebar-simple-duotone text-xl" />
        <a href="/" className="text-2xl font-semibold flex items-center" style={{ color: designScheme.palette.primary }}>
          <img
            src="/logo-light-styled.png"
            alt="logo"
            className="w-[90px] inline-block dark:hidden"
            style={{ filter: currentTheme === 'dark' ? 'invert(1) brightness(2)' : 'none' }}
          />
          <img
            src="/logo-dark-styled.png"
            alt="logo"
            className="w-[90px] inline-block hidden dark:block"
          />
        </a>
      </div>
      {chat.started && ( // Display ChatDescription and HeaderActionButtons only when the chat has started.
        <>
          <span
            className="flex-1 px-4 truncate text-center"
            style={{ color: designScheme.palette.textSecondary }}
          >
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="">
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        </>
      )}
    </header>
  );
}
