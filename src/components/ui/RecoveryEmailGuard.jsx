import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoveryEmailStatus } from '../../hooks/useRecoveryEmailStatus';
import RecoveryEmailPromptModal from './RecoveryEmailPromptModal';

const RecoveryEmailGuard = ({ securityPagePath }) => {
  const { needsRecoveryEmail, refresh } = useRecoveryEmailStatus();
  const [dismissed, setDismissed] = useState(false);
  const location = useLocation();

  // Re-prompt whenever the user navigates to a new page, until they set a
  // recovery email. The security settings page itself is excluded so the form
  // there is never covered by the modal.
  useEffect(() => {
    setDismissed(false);
  }, [location.pathname]);

  const onSecurityPage = securityPagePath === location.pathname;
  const show = needsRecoveryEmail && !onSecurityPage && !dismissed;

  return (
    <RecoveryEmailPromptModal
      open={show}
      onClose={() => setDismissed(true)}
      onVerified={refresh}
    />
  );
};

export default RecoveryEmailGuard;