process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadImagesToCloudinary(pictures: any) {
  if (!pictures) return [];
  const files = Array.isArray(pictures) ? pictures : [pictures];

  const uploads = files.map(file =>
    cloudinary.v2.uploader.upload(file.filepath, {
      folder: 'form_uploads',
    })
  );
  const results = await Promise.all(uploads);
  return results.map(r => r.secure_url);
}
