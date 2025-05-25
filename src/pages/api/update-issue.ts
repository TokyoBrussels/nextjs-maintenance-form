// pages/api/update-issue.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateGoogleSheetRow } from '@/lib/google-sheet';
import { sendToDingTalk } from '@/lib/dingtalk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { rowIndex, ...fields } = req.body;

  if (!rowIndex) {
    return res.status(400).json({ message: 'Missing rowIndex' });
  }

  try {
    await updateGoogleSheetRow(parseInt(rowIndex, 10), fields);
    ///await sendToDingTalk(fields); // Optional: send notification
    res.status(200).json({ message: 'Row updated successfully' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
}
