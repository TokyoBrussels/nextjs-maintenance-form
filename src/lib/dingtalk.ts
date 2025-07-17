import axios from 'axios';

export async function sendToDingTalk(fields: any, imageUrls: string[]) {
  
  const station = Array.isArray(fields.station) ? fields.station[0] : fields.station;
  const addMoreCaseUrl = process.env.NEXT_PUBLIC_ADD_MORE_CASE_URL;

  let webhookUrl = '';
  switch (station) {
    case 'SSW':
      webhookUrl = process.env.DINGTALK_WEBHOOK_SSW!;
      break;
    case 'TPK':
      webhookUrl = process.env.DINGTALK_WEBHOOK_TPK!;
      break;
    default:
      throw new Error(`No webhook configured for station: ${station}`);
  }
  if (!webhookUrl) {
    throw new Error(`Missing webhook URL for station: ${fields.station}`);
  }

  const markdown = `
### 📋 Maintenance Issue Report
- **Node:** ${fields.station}
- **เวลาที่ได้รับแจ้ง:** ${fields.reportDate}
- **ชื่อผู้แจ้ง:** ${fields.reporter}
- **ตำแหน่งที่พบปัญหา:** ${fields.location}
- **ลักษณะปัญหา:** ${fields.issue}
- **สาเหตุ:** ${fields.rootCause}
- **การแก้ไข:** ${fields.repairDetail}
- **เริ่มซ่อม-ซ่อมเสร็จ-กลับมาทำงานปกติ:** ${fields.startTime} - ${fields.endTime} - ${fields.recoverTime}
- **ประเภทของสาเหตุ:** ${fields.classify}
- **ชิ้นส่วนที่ได้รับความเสียหาย:** ${fields.is_damage}
\n\n
${imageUrls.map((url, i) => `![Image${i + 1}](${url})`).join('\n')}
\n\n
[ADD MORE CASE](${addMoreCaseUrl})
`;

  await axios.post(webhookUrl, {
    msgtype: 'markdown',
    markdown: {
      title: 'New Issue Report',
      text: markdown,
    },
  });
}
