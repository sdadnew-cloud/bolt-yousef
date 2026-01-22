
import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { Form, useActionData, useTransition } from '@remix-run/react';
import { supabase } from '~/lib/supabase';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signUp({ email, password });

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

export default function Signup() {
  const actionData = useActionData();
  const transition = useTransition();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="font-bold text-center text-gray-900 dark:text-white" style={{ fontSize: 'var(--font-size-2xl)' }}>
          Create a new account
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
              className="sm:text-sm rounded-lg block w-full p-2.5"
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
              autoComplete="new-password"
              required
              className="sm:text-sm rounded-lg block w-full p-2.5"
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
            {transition.state === 'submitting' ? 'Signing up...' : 'Sign up'}
          </button>
        </Form>
      </div>
    </div>
  );
}
