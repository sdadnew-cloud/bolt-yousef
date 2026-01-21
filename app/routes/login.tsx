
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { Form, useActionData, useTransition } from '@remix-run/react';
import { supabase } from '~/lib/supabase';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  return null;
};

export const loader: LoaderFunction = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // Redirect to chat if already logged in
    const headers = new Headers();
    headers.append('Location', '/');
    return new Response(null, {
      status: 302,
      headers,
    });
  }

  return null;
};

export default function Login() {
  const actionData = useActionData();
  const transition = useTransition();

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="font-bold text-center text-gray-900 dark:text-white" style={{ fontSize: 'var(--font-size-2xl)' }}>
          Login to your account
        </h1>
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              style={{
                borderColor: 'var(--bolt-elements-borderColor)',
                color: 'var(--bolt-elements-textPrimary)',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              style={{
                borderColor: 'var(--bolt-elements-borderColor)',
                color: 'var(--bolt-elements-textPrimary)',
              }}
            />
          </div>
          {actionData?.error && (
            <p className="text-sm text-red-500">{actionData.error}</p>
          )}
          <button
            type="submit"
            disabled={transition.state === 'submitting'}
            className="w-full font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            style={{
              backgroundColor: 'var(--bolt-elements-button-primary-background)',
              color: 'var(--bolt-elements-button-primary-text)',
            }}
          >
            {transition.state === 'submitting' ? 'Logging in...' : 'Log in'}
          </button>
        </Form>
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative px-2 text-sm text-gray-500 bg-white dark:bg-gray-800">
            Or continue with
          </div>
        </div>
        <div>
          <button
            onClick={handleGitHubLogin}
            className="w-full inline-flex justify-center py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="github"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 496 512"
            >
              <path
                fill="currentColor"
                d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3.3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 0-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 22.4-56.2-2.3-6.2-10-26.5 2.8-51.7 0 0 21.2-6.8 69.6 25.8 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c48.4-32.6 69.6-25.8 69.6-25.8 12.8 25.2 5.1 45.5 2.8 51.7 14.8 14.9 22.4 28.7 22.4 56.2 0 96.5-56.6 104.2-112.6 110.2 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
              />
            </svg>
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
