import api from "../client";

export const uploadApi = {
  presignedUrl: (key: string, contentType: string) =>
    api.post("/upload/presigned-url", { key, contentType }),
  uploadFile: (key: string, base64: string, contentType: string) =>
    api.put(`/upload/file?key=${encodeURIComponent(key)}`, { base64, contentType }),
  uploadVideo: (uid: string, base64: string, contentType: string) =>
    api.put(`/upload/video/${uid}`, { base64, contentType }),
};