import * as Sentry from '@sentry/react-native';
import { ENV } from './env';

let _initialized = false;

export function initSentry() {
  if (_initialized) return;
  if (!ENV.SENTRY_DSN) {
    if (__DEV__) console.warn('[sentry] No DSN configured for this platform');
    return;
  }
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 0 : 0.1,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
  _initialized = true;
}

export function captureException(err: unknown, context?: Record<string, unknown>) {
  if (!_initialized) return;
  Sentry.captureException(err, { extra: context });
}

export function setSentryUser(userId: string | null) {
  if (!_initialized) return;
  if (userId) Sentry.setUser({ id: userId });
  else Sentry.setUser(null);
}
