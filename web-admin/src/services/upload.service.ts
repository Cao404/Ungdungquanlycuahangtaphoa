import axiosInstance from './api';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export async function uploadHinhAnh(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await axiosInstance.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const payload = res.data;
  return payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
}
