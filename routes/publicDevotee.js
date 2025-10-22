import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';

dotenv.config();
const router = express.Router();

const PUBLIC_PHOTO_DIR = path.resolve(__dirname, '../public/devotee-photos');
const PUBLIC_XLS_PATH = path.resolve(__dirname, '../public/devotees.xlsx');
if (!fs.existsSync(PUBLIC_PHOTO_DIR)) {
  fs.mkdirSync(PUBLIC_PHOTO_DIR, { recursive: true });
  console.log('[publicDevotee] Created photo directory:', PUBLIC_PHOTO_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('[publicDevotee] Saving photo to:', PUBLIC_PHOTO_DIR);
    cb(null, PUBLIC_PHOTO_DIR);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    console.log('[publicDevotee] Generated filename:', filename);
    cb(null, filename);
  }
});
const upload = multer({ storage });

async function appendToXLS(data) {
  let workbook, worksheet;
  if (fs.existsSync(PUBLIC_XLS_PATH)) {
    console.log('[publicDevotee] XLS exists, loading:', PUBLIC_XLS_PATH);
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(PUBLIC_XLS_PATH);
    worksheet = workbook.getWorksheet(1);
  } else {
    console.log('[publicDevotee] XLS does not exist, creating new:', PUBLIC_XLS_PATH);
    workbook = new ExcelJS.Workbook();
    worksheet = workbook.addWorksheet('Devotees');
    worksheet.addRow([
      'first_name', 'middle_name', 'last_name', 'gender', 'dob', 'ethnicity', 'citizenship',
      'marital_status', 'education_qualification_code', 'address1', 'address2', 'pin_code',
      'email', 'mobile_no', 'whatsapp_no', 'initiated_name', 'photo_path', 'spiritual_master_id',
      'first_initiation_date', 'iskcon_first_contact_date', 'second_initiated', 'second_initiation_date',
      'full_time_devotee', 'temple_name', 'status', 'facilitator_id'
    ]);
  }
  worksheet.addRow([
    data.first_name, data.middle_name, data.last_name, data.gender, data.dob, data.ethnicity, data.citizenship,
    data.marital_status, data.education_qualification_code, data.address1, data.address2, data.pin_code,
    data.email, data.mobile_no, data.whatsapp_no, data.initiated_name, data.photo_path, data.spiritual_master_id,
    data.first_initiation_date, data.iskcon_first_contact_date, data.second_initiated, data.second_initiation_date,
    data.full_time_devotee, data.temple_name, data.status, data.facilitator_id
  ]);
  await workbook.xlsx.writeFile(PUBLIC_XLS_PATH);
  console.log('[publicDevotee] Appended new row to XLS for:', data.email);
}

// 🔹 Add Public Devotee Entry
router.post('/public', upload.single('photo'), async (req, res) => {
  console.log('[publicDevotee] POST /public called');
  try {
    const data = req.body;
    console.log('[publicDevotee] Received data:', data);
    if (req.file) {
      data.photo_path = `/public-entry/devotee-photos/${req.file.filename}`;
      console.log('[publicDevotee] Photo uploaded:', data.photo_path);
    } else {
      data.photo_path = '';
      console.log('[publicDevotee] No photo uploaded');
    }
    await appendToXLS(data);
    res.status(201).json({ message: 'Entry submitted successfully', photo_path: data.photo_path });
    console.log('[publicDevotee] Entry submitted for:', data.email);
  } catch (error) {
    console.error('❌ [publicDevotee] Public devotee entry error:', error);
    res.status(500).json({ error: 'Failed to submit entry', details: error.message });
  }
});

export default router;