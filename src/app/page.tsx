'use client';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EditForm from '@/components/EditForm';
import { format } from 'date-fns';

type FormData = {
  station: string;
  reportDate: string;
  reporter: string;
  location: string;
  issue: string;
  rootCause: string;
  repairDetail: string;
  startTime: string; 
  endTime: string;
  recoverTime: string;
  classify: string;
  pictures: FileList;
};

export default function Home() {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [reportDate, setReportDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [recoverTime, setRecoverTime] = useState<Date | null>(null);
  const [showCustomClassify, setShowCustomClassify] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'edit'>('form');
  
  useEffect(() => {
    setHasMounted(true);
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setIsLoggedIn(true);
      setEmail(savedEmail);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/validate-user', { email });
      if (res.data.ok) {
        localStorage.setItem('userEmail', email);
        setIsLoggedIn(true);
      } else {
        setError('Email not authorized.');
      }
    } catch {
      setError('Error validating email.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files).map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  if (!hasMounted) return null;

  if (!isLoggedIn) {
    return (
      <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-20 space-y-4 p-4 border rounded">
        <h2 className="text-xl font-semibold">Maintenance Forms</h2>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}  
          required
          placeholder="Enter your email"
          className="border p-2 w-full"
        />
        {error && <p className="text-red-500">{error}</p>}

        {/* Login and Register Button Row */}
        <div className="flex justify-between items-center">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Login
          </button>

          <a
          href={process.env.NEXT_PUBLIC_DINGTALK_REGISTER_URL}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          Contact PMO Admin
        </a>
        </div>
      </form>
    );
  }
    
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const formData = new FormData();
    const userEmail = localStorage.getItem('userEmail') || '';

    const formatDateTime = (date: Date | null) => 
      date ? format(date, 'dd MMM yyyy HH:mm') : '';

    const formatTimeOnly = (date: Date | null) =>
      date ? format(date, 'HH:mm') : '';

    const payload = {
      ...data,
      email: userEmail,
      reportDate: formatDateTime(reportDate),
      startTime: formatTimeOnly(startTime),
      endTime: formatTimeOnly(endTime),
      recoverTime: formatTimeOnly(recoverTime),
    };

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
    setLoading(false);
    reset();
    setStartTime(null);
    setEndTime(null);
    setRecoverTime(null);
    setReportDate(null);
    setPreviewUrls([]);
    alert('Submitted!');
  };


  if (!hasMounted) return null;
  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex space-x-4 justify-center mt-4">
        <button
          onClick={() => setActiveTab('form')}
          className={`
            px-6 py-2 rounded-lg text-sm font-medium
            transition duration-300 ease-in-out transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${activeTab === 'form'
              ? 'bg-blue-600 text-white shadow-md' // Slightly darker blue when active, add shadow
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm' // Gray when inactive, hover effect
            }
          `}
        >
          ส่งรายงาน
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`
            px-6 py-2 rounded-lg text-sm font-medium
            transition duration-300 ease-in-out transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            ${activeTab === 'edit'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm'
            }
          `}
        >
          แก้ใขรายงาน
        </button>
      </div>

      {/* Form Tab */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {email && (
              <span className="email-text text-sm text-gray-600">
                Logged in as <strong>{email}</strong>
              </span>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('userEmail');
                setEmail('');
                setIsLoggedIn(false);
              }}
              className="logout-button text-sm text-red-600 underline"
            >
              Logout
            </button>
          </div>
          <select {...register("station", { required: true })} className="border p-2 w-full">
            <option value="SSW">SSW</option>
            <option value="TPK">TPK</option>
          </select>

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

          <input placeholder="ชื่อผู้แจ้ง" {...register("reporter", { required: true })} className="border p-2 w-full" />
          <input placeholder="พื้นที่ / ตำแหน่งที่พบปัญหา" {...register("location", { required: true })} className="border p-2 w-full" />
          <input placeholder="ลักษณะปัญหา" {...register("issue", { required: true })} className="border p-2 w-full" />
          <input placeholder="สาเหตุ" {...register("rootCause", { required: true })} className="border p-2 w-full" />
          <input placeholder="การแก้ไข" {...register("repairDetail", { required: true })} className="border p-2 w-full" />

          {/* Time Pickers */}
          <div className="grid grid-cols-3 gap-4">
          <div>
            <DatePicker
              selected={startTime}
              onChange={(date) => {
                setStartTime(date);
                if (date) setValue('startTime', date.toISOString());
              }}
              showTimeSelect
              showTimeSelectOnly
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="HH:mm"
              placeholderText="เวลาเริ่มซ่อม"
              className="border p-2 w-full"
            />
          </div>

          <div>
            <DatePicker
              selected={endTime}
              onChange={(date) => {
                setEndTime(date);
                if (date) setValue('endTime', date.toISOString());
              }}
              showTimeSelect
              showTimeSelectOnly
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="HH:mm"
              placeholderText="เวลาซ่อมเสร็จ"
              className="border p-2 w-full"
            />
          </div>

          <div>
            <DatePicker
              selected={recoverTime}
              onChange={(date) => {
                setRecoverTime(date);
                if (date) setValue('recoverTime', date.toISOString());
              }}
              showTimeSelect
              showTimeSelectOnly
              timeFormat="HH:mm"
              timeIntervals={15}
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

          <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}

      {/* Edit Tab */}
      {activeTab === 'edit' && (
         <EditForm />
      )}
    </div>
  );
}
