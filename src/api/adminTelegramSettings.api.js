import api from "./axios";

/**
 * SUPER_ADMIN Telegram destination used to notify the super admin when an owner
 * submits a property for approval.
 *
 * <p>The bot token is write-only: the API only ever returns `botTokenConfigured`
 * and a fixed `maskedBotToken`, never the credential itself.</p>
 */
export const adminTelegramSettingsApi = {
  getTelegramSettings: async () => {
    const res = await api.get("/admin/settings/telegram");
    return res.data;
  },

  updateTelegramSettings: async (data) => {
    const res = await api.put("/admin/settings/telegram", data);
    return res.data;
  },
};

export default adminTelegramSettingsApi;
