import api from "./axios";

export const roomUtilityApi = {
  getRoomUtilities: (roomId) =>
    api.get(`/rooms/${roomId}/utilities`).then((res) => res.data),

  assignUtility: (roomId, utilityTypeId, isIncluded = false) =>
    api.post(`/rooms/${roomId}/utilities/${utilityTypeId}`, { isIncluded }).then((res) => res.data),

  removeUtility: (roomId, utilityTypeId) =>
    api.delete(`/rooms/${roomId}/utilities/${utilityTypeId}`).then((res) => res.data),
};
