// import { supabase } from '@/integrations/supabase/client';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads an image file to Supabase Storage and returns the public URL
 * @param file - The image file to upload
 * @param userId - The user ID for organizing files
 * @returns Promise with upload result containing URL or error
 */
export async function uploadImage(file: File, userId: string): Promise<ImageUploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }

    // Validate file size (max 5MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { success: false, error: 'Image must be less than 5MB' };
    }

    // Generate unique filename logic not needed as server handles it, but we can keep validations

    // Upload to Local Server
    const formData = new FormData();
    formData.append('file', file);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return { success: true, url: data.url };
  } catch (error) {
    console.error('Image upload error:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}

/**
 * Converts a base64 data URL to a File object
 * @param dataUrl - The base64 data URL
 * @param filename - Optional filename
 * @returns File object
 */
export function dataUrlToFile(dataUrl: string, filename = 'pasted-image.png'): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * Uploads a base64 image and returns the public URL
 * @param dataUrl - The base64 data URL
 * @param userId - The user ID for organizing files
 * @returns Promise with upload result containing URL or error
 */
export async function uploadBase64Image(dataUrl: string, userId: string): Promise<ImageUploadResult> {
  try {
    const file = dataUrlToFile(dataUrl);
    return await uploadImage(file, userId);
  } catch (error) {
    console.error('Base64 upload error:', error);
    return { success: false, error: 'Failed to process image' };
  }
}
