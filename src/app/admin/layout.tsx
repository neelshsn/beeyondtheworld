import { Suspense, type ReactNode } from 'react';

import { AdminAuthGate } from './_components/admin-auth-gate';
import { AdminShell } from './_components/admin-shell';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AdminAuthGate>
        <AdminShell>{children}</AdminShell>
      </AdminAuthGate>
    </Suspense>
  );
}
