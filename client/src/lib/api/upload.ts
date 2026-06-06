import api from "../client";

export const uploadApi = {
  presignedUrl: (key: string, contentType: string) =>
    api.post("/upload/presigned-url", { key, contentType }),
};