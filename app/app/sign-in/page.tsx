'use client';
import { useState } from 'react';
import { Shell } from '@/components/Shell';
import { supabaseConfigured } from '@/lib/supabase/config';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function SignIn() {
  const [err, setErr] = useState('');
  async function google() {
    setErr('');
    const { error } = await supabaseBrowser().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } });
    if (error) setErr('Sign-in failed. Try again.');
  }
  return (
    <Shell title="Sign in">
      {supabaseConfigured ? (
        <div className="grid gap-3">
          <button onClick={google} className="min-h-[52px] w-full rounded-md bg-accent font-semibold text-on-accent">Continue with Google</button>
          {err && <p role="alert" className="text-danger">{err}</p>}
        </div>
      ) : (
        <p className="rounded-md border border-border bg-surface p-4">Sign-in is unavailable: Supabase settings are missing. See app/.env.example.</p>
      )}
    </Shell>
  );
}
