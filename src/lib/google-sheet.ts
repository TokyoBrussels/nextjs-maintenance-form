import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function formatDateTime(dt: Date | string | undefined | null) {
  if (!dt) return ''; // Return empty string if undefined/null
  const date = typeof dt === 'string' ? new Date(dt) : dt;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export async function sendToGoogleSheet(fields: any) {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        String(fields.station),
        formatDateTime(fields.reportDate),
        String(fields.reporter),
        String(fields.location),
        String(fields.issue),
        String(fields.rootCause),
        String(fields.repairDetail),
        String(fields.startTime),
        String(fields.endTime),
        String(fields.recoverTime),
        String(fields.classify),
        new Date().toISOString(),
        String(fields.email),
      ]],
    },
  });
}

export async function updateGoogleSheetRow(rowIndex: number, fields: any) {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.GOOGLE_SHEET_ID!;

  const range = `Sheet1!A${rowIndex}:M${rowIndex}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        String(fields.station),
        formatDateTime(fields.reportDate),
        String(fields.reporter),
        String(fields.location),
        String(fields.issue),
        String(fields.rootCause),
        String(fields.repairDetail),
        String(fields.startTime),
        String(fields.endTime),
        String(fields.recoverTime),
        String(fields.classify),
        new Date().toISOString(), // Updated timestamp
        String(fields.email),
      ]],
    },
  });
}
