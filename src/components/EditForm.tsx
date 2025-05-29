'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Issue = {
  rowIndex: number;
  station: string;
  issue: string;
  reporter: string;
  location: string;
  rootCause: string;
  repairDetail: string;
  startTime: string;
  endTime: string;
  recoverTime: string;
  classify: string;
  email?: string;
  reportDate?: string;
  pictures: FileList;
};

const formatTimeToDate = (time: string): Date | null => {
  if (!time) return null;
  const now = new Date();
  const [hh, mm] = time.split(':');
  now.setHours(parseInt(hh), parseInt(mm), 0, 0);
  return now;
};

export default function EditForm() {
  const { register, setValue, handleSubmit } = useForm<Issue>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [recoverTime, setRecoverTime] = useState<Date | null>(null);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState<number | null>(null);
  const [reportDate, setReportDate] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showCustomClassify, setShowCustomClassify] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  useEffect(() => {
    async function fetchIssues() {
        const res = await fetch('/api/issues');
        const data = await res.json();
        setIssues(data); // Store in local state
    }
    fetchIssues();
    }, []);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) setEmail(email);
    }, []);

  const handleIssueSelect = (rowId: string) => {
    const issue = issues.find(i => i.rowIndex.toString() === rowId);
    if (!issue) return;
    setSelectedIssue(issue);
    setValue('station', issue.station);
    setValue('reporter', issue.reporter);
    setValue('location', issue.location);
    setValue('issue', issue.issue);
    setValue('rootCause', issue.rootCause);
    setValue('repairDetail', issue.repairDetail);
    setValue('classify', issue.classify);
    setStartTime(formatTimeToDate(issue.startTime));
    setEndTime(formatTimeToDate(issue.endTime));
    setRecoverTime(formatTimeToDate(issue.recoverTime));

    const reportDateObj = issue.reportDate ? new Date(issue.reportDate) : null;
    setReportDate(reportDateObj);
    setValue('reportDate', issue.reportDate || '');
  };

  const formatDateTimeToLocalString = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleString('en-GB', {
        timeZone: 'Asia/Bangkok',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).replace(',', '');
  };

  const onSubmit = async (data: Issue) => {
    const userEmail = localStorage.getItem('userEmail') || '';
    const toISOStringWithOffset = (date: Date | null, offsetHours = 7) =>
        date ? new Date(date.getTime() + offsetHours * 60 * 60 * 1000).toISOString() : '';
    const payload = {
        ...data,
        email: userEmail,
        station: selectedIssue?.station || '',
        startTime: toISOStringWithOffset(startTime).slice(11, 16),
        endTime: toISOStringWithOffset(endTime).slice(11, 16),
        recoverTime: toISOStringWithOffset(recoverTime).slice(11, 16),
        reportDate: formatDateTimeToLocalString(reportDate),
        rowIndex: selectedIssue?.rowIndex,   
    };

    const formData = new FormData();
     for (const key in payload) {
        if (key === 'pictures') {
        Array.from(data.pictures).forEach(file =>
          formData.append('pictures', file)
        );
      } else {
        formData.append(key, (payload as any)[key]);
      }
    }

    await axios.post('/api/submit', formData);
    alert('Issue updated!');
    };


  const filteredIssues = selectedStation
    ? issues.filter(i => i.station === selectedStation)
    : [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
        <div className="flex items-center justify-between gap-4">
            {email && (
              <span className="email-text text-sm text-gray-600">
                Logged in as <strong>{email}</strong>
              </span>
            )}
        </div>
      <select onChange={e => setSelectedStation(e.target.value)} className="border p-2 w-full">
        <option value="">Node Name</option>
        <option value="SSW">SSW</option>
        <option value="TPK">TPK</option>
      </select>

      <select
        value={selectedIssueIndex ?? ''}
        onChange={(e) => {
            const index = parseInt(e.target.value, 10);
            const issue = filteredIssues[index];
            if (issue) {
            setSelectedIssueIndex(index);
            handleIssueSelect(issue.rowIndex.toString());
            }
        }}
        className="border p-2 w-full"
        >
        <option value="">เลือกหัวข้อที่ต้องการแก้ใข</option>
        {filteredIssues.map((issue, index) => (
            <option key={issue.rowIndex} value={index}>
            Row {issue.rowIndex}: {issue.issue}
            </option>
        ))}
      </select>
      {selectedIssue?.reportDate && (
        <>
            <DatePicker
            selected={reportDate}
            onChange={(date) => {
                setReportDate(date);
                if (date) setValue('reportDate', date.toISOString());
            }}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd-MMM-yyyy HH:mm"
            placeholderText="วันและเวลาที่ได้รับแจ้ง"
            className="border p-2 w-full"
            />
        </>
        )}
      <input placeholder="ชื่อผู้แจ้ง" {...register('reporter')} className="border p-2 w-full" />
      <input placeholder="พื้นที่ / ตำแหน่งที่พบปัญหา" {...register('location')} className="border p-2 w-full" />
      <input placeholder="ลักษณะปัญหา" {...register("issue")} className="border p-2 w-full" />
      <input placeholder="สาเหตุ" {...register('rootCause')} className="border p-2 w-full" />
      <input placeholder="การแก้ไข" {...register('repairDetail')} className="border p-2 w-full" />

     <div className="grid grid-cols-3 gap-4">
        <div>
            <DatePicker
            selected={startTime}
            onChange={date => setStartTime(date)}
            showTimeSelectOnly
            showTimeSelect
            timeIntervals={15}
            timeFormat="HH:mm"
            dateFormat="HH:mm"
            placeholderText="เวลาเริ่มซ่อม"
            className="border p-2 w-full"
            />
        </div>

        <div>
            <DatePicker
            selected={endTime}
            onChange={date => setEndTime(date)}
            showTimeSelectOnly
            showTimeSelect
            timeIntervals={15}
            timeFormat="HH:mm"
            dateFormat="HH:mm"
            placeholderText="เวลาซ่อมเสร็จ"
            className="border p-2 w-full"
            />
        </div>

        <div>
            <DatePicker
            selected={recoverTime}
            onChange={date => setRecoverTime(date)}
            showTimeSelectOnly
            showTimeSelect
            timeIntervals={15}
            timeFormat="HH:mm"
            dateFormat="HH:mm"
            placeholderText="เวลากลับมาใช้งาน"
            className="border p-2 w-full"
            />
        </div>
        </div>
        <select
            {...register("classify", { required: true })}
            className="border p-2 w-full"
            onChange={(e) => {
              const value = e.target.value;
              setShowCustomClassify(value === "Other");
              setValue("classify", value);
            }}
          >
            <option value="">เลือกประเภทของสาเหตุ</option>
            <option value="Operation">Operation</option>
            <option value="Machine">Machine</option>
            <option value="Other">Other</option>
          </select>

          {showCustomClassify && (
            <input
              placeholder="Enter custom classification"
              className="border p-2 w-full"
              {...register("classify", { required: true })}
            />
          )}

      {/* Image Upload */}
        <div>
        <label
            htmlFor="fileUpload"
            className="block border-dashed border-2 border-blue-400 rounded-md p-4 text-center cursor-pointer hover:bg-blue-50"
        >
            📷 Click to upload images
        </label>
        <input
            id="fileUpload"
            type="file"
            {...register('pictures')}
            multiple
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
        />
        </div>

        {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
            {previewUrls.map((url, index) => (
            <img
                key={index}
                src={url}
                alt={`preview-${index}`}
                className="w-full h-24 object-cover rounded shadow"
            />
            ))}
        </div>
        )}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </form>
  );
}
