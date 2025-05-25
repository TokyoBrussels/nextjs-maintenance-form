// pages/api/issues.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A2:M', // Skipping header row
  });

  const rows = response.data.values || [];

  const issues = rows.map((row, index) => ({
    rowIndex: index + 2, // Google Sheets row number
    station: row[0],
    reportDate: row[1],
    reporter: row[2],
    location: row[3],
    issue: row[4],
    rootCause: row[5],
    repairDetail: row[6],
    startTime: row[7],
    endTime: row[8],
    recoverTime: row[9],
    classify: row[10],
    timestamp: row[11],
    email: row[12],
  }));

  res.status(200).json(issues);
}
