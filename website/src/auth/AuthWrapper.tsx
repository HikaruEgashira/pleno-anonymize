import { AuthProvider } from 'react-oauth2-code-pkce';
import { authConfig } from './authConfig';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return <AuthProvider authConfig={authConfig}>{children}</AuthProvider>;
}
