import type { AuthSession, AuthUser } from './api';

export type { AuthUser };

const STORAGE_KEY = 'vietfly.session';

const demoNames: Record<string, string> = {
  'admin@vietfly.vn': 'Quản trị VietFly',
  'manager@vietfly.vn': 'Quản lý đại lý',
  'staff@vietfly.vn': 'Nhân viên bán vé',
  'customer@test.vn': 'Khách hàng thử nghiệm'
};

export function saveSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AuthSession;
    const normalizedName = demoNames[session.user.email];
    if (normalizedName && session.user.fullName !== normalizedName) {
      const normalized = {
        ...session,
        user: {
          ...session.user,
          fullName: normalizedName
        }
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }
    return session;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  return getSession()?.user ?? null;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
