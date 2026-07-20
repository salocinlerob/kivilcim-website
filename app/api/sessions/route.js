import { getSessions } from '@/lib/sessions';

export async function GET() {
  const sessions = await getSessions();
  return Response.json(sessions);
}
