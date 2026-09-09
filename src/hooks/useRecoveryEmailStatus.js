import { useState, useCallback, useEffect } from 'react';
import { securityApi } from '../api/security.api';
import { useAuthStore } from '../store/auth.store';

export function useRecoveryEmailStatus() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryEmailVerified, setRecoveryEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await securityApi.getMySecurity();
      setRecoveryEmail(data.recoveryEmail || '');
      setRecoveryEmailVerified(Boolean(data.recoveryEmailVerified));
    } catch {
      // ignore, leave existing state
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const needsRecoveryEmail = !loading && !recoveryEmailVerified;

  return {
    recoveryEmail,
    recoveryEmailVerified,
    loading,
    needsRecoveryEmail,
    refresh: fetchStatus,
  };
}
