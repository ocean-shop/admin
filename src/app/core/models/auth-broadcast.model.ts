import { AUTH_BROADCAST_EVENTS } from './auth-broadcast.enum';
import { AuthResponse } from './auth.model';

export type AuthSessionBroadcast = {
  type: typeof AUTH_BROADCAST_EVENTS.SESSION;
  session: AuthResponse;
};

export type AuthLogoutBroadcast = {
  type: typeof AUTH_BROADCAST_EVENTS.LOGOUT;
};

/** Messages tabs exchange so that one login, refresh or logout applies to all of them. */
export type AuthBroadcastMessage = AuthSessionBroadcast | AuthLogoutBroadcast;
