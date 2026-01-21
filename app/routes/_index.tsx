import { json, type MetaFunction, type LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { supabase } from '~/lib/supabase';

export const meta: MetaFunction = () => {
  return [{ title: 'Bolt' }, { name: 'description', content: 'Talk with Bolt, an AI assistant from StackBlitz' }];
};

export const loader: LoaderFunction = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Redirect to login if not authenticated
    const headers = new Headers();
    headers.append('Location', '/login');
    return new Response(null, {
      status: 302,
      headers,
    });
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return json({ messages: [] });
  }

  return json({ messages });
};

/**
 * Landing page component for Bolt
 * Note: Settings functionality should ONLY be accessed through the sidebar menu.
 * Do not add settings button/panel to this landing page as it was intentionally removed
 * to keep the UI clean and consistent with the design system.
 */
export default function Index() {
  const { messages } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat initialMessages={messages} />}</ClientOnly>
    </div>
  );
}
