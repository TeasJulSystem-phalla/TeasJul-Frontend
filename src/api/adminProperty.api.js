import api from "./axios";

// ADMIN / SUPER_ADMIN property posting (`/admin/properties`). This flow is
// deliberately separate from the OWNER portal: an admin posts a complete
// property on behalf of an owner that may be an OWNER account or a plain
// non-login owner record. The backend never auto-creates login accounts here.
export const adminPropertyApi = {
  listProperties: ({ search, propertyType, status, page = 0, size = 10 } = {}) =>
    api
      .get("/admin/properties", {
        params: {
          ...(search ? { search } : {}),
          ...(propertyType ? { propertyType } : {}),
          ...(status ? { status } : {}),
          page,
          size,
        },
      })
      .then((res) => res.data),

  getProperty: (id) => api.get(`/admin/properties/${id}`).then((res) => res.data),

  createProperty: (data) =>
    api.post("/admin/properties", data).then((res) => res.data),

  updateProperty: (id, data) =>
    api.put(`/admin/properties/${id}`, data).then((res) => res.data),

  getCatalog: () => api.get("/admin/properties/catalog").then((res) => res.data),

  listPropertyOwners: ({ search, page = 0, size = 10 } = {}) =>
    api
      .get("/admin/properties/owners", {
        params: {
          ...(search ? { search } : {}),
          page,
          size,
        },
      })
      .then((res) => res.data),

  createPropertyOwner: (data) =>
    api.post("/admin/properties/owners", data).then((res) => res.data),

  deletePropertyOwner: (id) =>
    api.delete(`/admin/properties/owners/${id}`).then((res) => res.data),
};