import type { Metadata } from 'next';
import { Doc } from '@/components/Doc';
import { APP_NAME } from '@/lib/brand';

export const metadata: Metadata = { title: `Privacy: ${APP_NAME}` };

export default function Privacy() {
  return (
    <Doc title="Privacy">
      <p>This explains what {APP_NAME} collects, why, who else handles it, and how to delete it.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Your email address and account ID, from Google sign-in.</li>
        <li>What you type, dictate or attach to describe a screen. Attached images are sent to the AI service with your request and are not kept by us.</li>
        <li>The screens, versions and DESIGN.md text you create.</li>
        <li>Usage counts per month, so we can apply limits.</li>
      </ul>
      <h2>Who handles it</h2>
      <ul>
        <li>Supabase: stores your account and projects.</li>
        <li>Google: provides sign-in, and its Gemini models process your prompts and images to produce designs. Google’s own terms govern how it handles that data.</li>
        <li>Our hosting provider: serves the app. [add the host’s name before launch]</li>
      </ul>
      <p>We do not sell your data. We do not use advertising or analytics cookies today. If that changes, this page will say so first.</p>
      <h2>Cookies</h2>
      <p>Only the cookies needed to keep you signed in.</p>
      <h2>Keeping and deleting</h2>
      <p>We keep your projects until you delete them or your account. You can delete your account on the Account page. That removes your projects, screens, versions and usage records. Backups held by our providers may keep copies for a short time afterwards.</p>
      <h2>Your rights</h2>
      <p>Depending on where you live, you may have rights to access, correct or delete your data. Deleting is self-service. For anything else, write to [add a contact email before launch].</p>
    </Doc>
  );
}
