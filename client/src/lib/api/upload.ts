import api from "../client";

export const uploadApi = {
  presignedUrl: (key: string, contentType: string) =>
    api.post("/upload/presigned-url", { key, contentType }),
  uploadFile: (key: string, body: ArrayBuffer, contentType: string) =>
    api.put(`/upload/file/${key}`, body, { headers: { "Content-Type": contentType } }),
};