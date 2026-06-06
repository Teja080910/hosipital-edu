import api from "../client";

export const translationsApi = {
  list: (params?: { locale?: string; namespace?: string }) =>
    api.get("/translations", { params }),
  create: (data: { key: string; locale: string; value: string; namespace?: string }) =>
    api.post("/translations", data),
  update: (id: string, data: { value: string }) =>
    api.put(`/translations/${id}`, data),
  export: () => api.post("/translations/export"),
  autoTranslate: (sourceLocale: string, targetLocale: string, namespace?: string) =>
    api.post("/translations/auto-translate", { sourceLocale, targetLocale, namespace }),
};