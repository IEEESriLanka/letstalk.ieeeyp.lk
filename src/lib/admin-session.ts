export const adminSessionExpiredMessage = "Your session has expired. Please sign in again.";

type Session = { access_token: string; expires_at?: number };
type SessionResult = { data: { session: Session | null }; error: unknown };
type SessionAuth = {
  getSession: () => Promise<SessionResult>;
  refreshSession: () => Promise<SessionResult>;
};

// Retry only a rejected session, before the server has performed any writes.
// Network, permission and account-operation errors must not repeat mutations.
export async function withAdminSession<T>(
  auth: SessionAuth,
  operation: (accessToken: string) => Promise<T>,
): Promise<T> {
  const initial = await auth.getSession();
  if (initial.error || !initial.data.session?.access_token)
    throw new Error(adminSessionExpiredMessage);
  let session = initial.data.session;
  let refreshed = false;
  async function refresh() {
    const result = await auth.refreshSession();
    if (result.error || !result.data.session?.access_token)
      throw new Error(adminSessionExpiredMessage);
    refreshed = true;
    return result.data.session;
  }
  if (session.expires_at && session.expires_at * 1000 <= Date.now() + 60_000)
    session = await refresh();
  try {
    return await operation(session.access_token);
  } catch (error) {
    if (refreshed || !(error instanceof Error) || error.message !== adminSessionExpiredMessage)
      throw error;
    session = await refresh();
    return operation(session.access_token);
  }
}
