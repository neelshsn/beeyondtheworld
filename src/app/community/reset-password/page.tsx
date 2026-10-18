import type { Metadata } from 'next';
import { PasswordResetForm } from './reset-form';
export const metadata: Metadata = {
  title: 'Choose your password · Bee Community',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default function PasswordResetPage() {
  return <PasswordResetForm />;
}
