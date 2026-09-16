import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

if (process.env.VERCEL_ENV === 'production') {
  for (const name of [
    './migrate-location-seasons-20260916.mjs',
    './migrate-greece-feedback-20260906.mjs',
  ]) {
    const script = fileURLToPath(new URL(name, import.meta.url));
    const result = spawnSync(process.execPath, [script, '--apply'], { stdio: 'inherit' });
    if (result.error) console.error('The production migration could not start.');
    if (result.status !== 0) {
      process.exitCode = result.status ?? 1;
      break;
    }
  }
} else {
  console.info('Production content migrations skipped outside Vercel production.');
}
