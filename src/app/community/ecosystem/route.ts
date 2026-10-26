import { privatePermanentRedirect } from '../../dashboard/_lib/private-redirect';

export function GET(request: Request) {
  return privatePermanentRedirect(request, '/dashboard/ecosystem');
}
