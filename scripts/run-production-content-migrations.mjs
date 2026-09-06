import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

if (process.env.VERCEL_ENV === 'production') {
  const script = fileURLToPath(new URL('./migrate-greece-feedback-20260906.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [script, '--apply'], { stdio: 'inherit' });
  if (result.error) console.error('The production content migration could not start.');
  process.exitCode = result.status ?? 1;
} else {
  console.info('Production content migrations skipped outside Vercel production.');
}
