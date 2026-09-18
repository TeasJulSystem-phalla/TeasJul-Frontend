import api from "./axios";

export const publicRoomApi = {
  listRooms: (params = {}) => {
    const { page = 0, size = 12, ...rest } = params;
    const cleanParams = { page, size };

    Object.keys(rest).forEach((key) => {
      if (
        rest[key] !== null &&
        rest[key] !== undefined &&
        rest[key] !== ""
      ) {
        cleanParams[key] = rest[key];
      }
    });

    return api
      .get("/public/rooms", { params: cleanParams })
      .then((res) => res.data);
  },

  getRoom: (id) =>
    api.get(`/public/rooms/${id}`).then((res) => res.data),

  getSimilarRooms: (id) =>
    api.get(`/public/rooms/${id}/similar`).then((res) => res.data),

  listRoomTypes: () =>
    api.get("/public/room-types").then((res) => res.data),
};