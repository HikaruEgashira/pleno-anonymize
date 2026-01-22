import { useContext } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return {
    token: context.token,
    isAuthenticated: !!context.token,
    isLoading: context.loginInProgress,
    login: context.logIn,
    logout: context.logOut,
    error: context.error,
  };
}
