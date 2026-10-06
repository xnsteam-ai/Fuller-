'use client';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

export function SignOutButton() {
  const router = useRouter();
  return (
    <button onClick={async () => { await supabaseBrowser().auth.signOut(); router.push('/sign-in'); router.refresh(); }}
      className="mt-6 min-h-tap w-full rounded-md border border-border font-semibold">Sign out</button>
  );
}
