import type { TAuthConfig } from 'react-oauth2-code-pkce';

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const authConfig: TAuthConfig = {
  clientId: '851697904',
  authorizationEndpoint: 'https://invitely.plenoai.com/oauth/authorize',
  tokenEndpoint: 'https://invitely.plenoai.com/oauth/token',
  redirectUri: isLocalhost
    ? 'http://localhost:5173/callback'
    : 'https://plenoai.com/callback',
  scope: 'openid',
  // PKCE settings (S256)
  decodeToken: true,
  autoLogin: false,
  storage: 'session',
  storageKeyPrefix: 'pleno_auth_',
  clearURL: true,
};
