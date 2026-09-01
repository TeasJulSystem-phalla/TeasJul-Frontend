import { useState, useCallback, useEffect } from "react";
import { tenantInvitationApi } from "../api/tenantInvitation.api";

const extractError = (err, fallback) =>
  err.response?.data?.message || err.response?.data?.error || fallback;

export function useTenantInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tenantInvitationApi.getMyInvitations();
      setInvitations(data);
    } catch (err) {
      setError(extractError(err, "Failed to load tenant invitations."));
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvitation = useCallback(
    async (formData) => {
      setSubmitting(true);
      try {
        const created = await tenantInvitationApi.createInvitation(formData);
        fetchInvitations();
        return created;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchInvitations]
  );

  const revokeInvitation = useCallback(
    async (id) => {
      setSubmitting(true);
      try {
        await tenantInvitationApi.revokeInvitation(id);
        fetchInvitations();
      } finally {
        setSubmitting(false);
      }
    },
    [fetchInvitations]
  );

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return {
    invitations,
    loading,
    error,
    submitting,
    fetchInvitations,
    createInvitation,
    revokeInvitation,
  };
}