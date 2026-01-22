import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function CallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, error, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/docs', { replace: true });
      } else if (error) {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, error, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="h-8 w-8 text-[#171717] dark:text-[#ededed]" />
        <span className="text-xl font-medium text-[#171717] dark:text-[#ededed]">
          Pleno Anonymize
        </span>
      </div>

      {error ? (
        <div className="text-center">
          <p className="text-red-500 mb-4">認証エラーが発生しました</p>
          <p className="text-[#666] dark:text-[#8f8f8f] text-sm">{error}</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-[#666] dark:text-[#8f8f8f]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>認証処理中...</span>
        </div>
      )}
    </div>
  );
}
