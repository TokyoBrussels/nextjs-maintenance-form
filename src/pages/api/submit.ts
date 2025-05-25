// pages/api/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { uploadImagesToCloudinary } from '@/lib/cloudinary';
import { sendToGoogleSheet, updateGoogleSheetRow } from '@/lib/google-sheet';
import { sendToDingTalk } from '@/lib/dingtalk';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ multiples: true });

  const data = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { fields, files } = data;
  const imageUrls = await uploadImagesToCloudinary(files.pictures);

  if (fields.rowIndex) {
    const rowIndex = parseInt(fields.rowIndex, 10);
    await updateGoogleSheetRow(rowIndex, fields);
  } else {
    await sendToGoogleSheet(fields);
  }

  await sendToDingTalk(fields, imageUrls);

  res.status(200).json({ ok: true });
}
