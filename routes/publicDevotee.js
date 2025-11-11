/**
 * @swagger
 * /publicDevotee/public:
 *   post:
 *     summary: Add a public devotee entry
 *     tags: [PublicDevotee]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               middle_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               email:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Entry submitted successfully
 *       500:
 *         description: Failed to submit entry
 */
import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';

dotenv.config();
const router = express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_PHOTO_DIR = path.resolve(__dirname, '../public/devotee-photos');
const PUBLIC_XLS_PATH = path.resolve(__dirname, '../public/devotees.xlsx');
// Ensure directories exist
if (!fs.existsSync(PUBLIC_PHOTO_DIR)) {
  fs.mkdirSync(PUBLIC_PHOTO_DIR, { recursive: true });
  console.log('[publicDevotee] Created photo directory:', PUBLIC_PHOTO_DIR);
}
const PUBLIC_XLS_DIR = path.dirname(PUBLIC_XLS_PATH);
if (!fs.existsSync(PUBLIC_XLS_DIR)) {
  fs.mkdirSync(PUBLIC_XLS_DIR, { recursive: true });
  console.log('[publicDevotee] Created XLS directory:', PUBLIC_XLS_DIR);
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
  let workbook = new ExcelJS.Workbook();
  let worksheet;
  if (fs.existsSync(PUBLIC_XLS_PATH)) {
    console.log('[publicDevotee] XLS exists, loading:', PUBLIC_XLS_PATH);
    await workbook.xlsx.readFile(PUBLIC_XLS_PATH);
    worksheet = workbook.getWorksheet('Devotees');
    if (!worksheet) {
      // If the first worksheet exists but is not named 'Devotees', rename it
      if (workbook.worksheets.length > 0) {
        worksheet = workbook.worksheets[0];
        worksheet.name = 'Devotees';
        console.log('[publicDevotee] Renamed worksheet to Devotees');
      } else {
        worksheet = workbook.addWorksheet('Devotees');
      }
    }
    // Ensure header row exists (only if worksheet is empty)
    if (worksheet.actualRowCount === 0) {
      worksheet.addRow([
        'first_name', 'middle_name', 'last_name', 'gender', 'dob', 'ethnicity', 'citizenship',
        'marital_status', 'education_qualification_code', 'address1', 'address2', 'pin_code',
        'email', 'mobile_no', 'whatsapp_no', 'initiated_name', 'photo_path', 'spiritual_master_id',
        'first_initiation_date', 'iskcon_first_contact_date', 'second_initiated', 'second_initiation_date',
        'full_time_devotee', 'temple_name', 'status', 'facilitator_id'
      ]);
    }
  } else {
    console.log('[publicDevotee] XLS does not exist, creating new:', PUBLIC_XLS_PATH);
    worksheet = workbook.addWorksheet('Devotees');
    worksheet.addRow([
      'first_name', 'middle_name', 'last_name', 'gender', 'dob', 'ethnicity', 'citizenship',
      'marital_status', 'education_qualification_code', 'address1', 'address2', 'pin_code',
      'email', 'mobile_no', 'whatsapp_no', 'initiated_name', 'photo_path', 'spiritual_master_id',
      'first_initiation_date', 'iskcon_first_contact_date', 'second_initiated', 'second_initiation_date',
      'full_time_devotee', 'temple_name', 'status', 'facilitator_id'
    ]);
  }
  // Find the last non-empty row
  let lastRowNumber = worksheet.lastRow ? worksheet.lastRow.number : 1;
  // If only header exists, lastRowNumber will be 1, so next row is 2
  worksheet.getRow(lastRowNumber + 1).values = [
    data.first_name, data.middle_name, data.last_name, data.gender, data.dob, data.ethnicity, data.citizenship,
    data.marital_status, data.education_qualification_code, data.address1, data.address2, data.pin_code,
    data.email, data.mobile_no, data.whatsapp_no, data.initiated_name, data.photo_path, data.spiritual_master_id,
    data.first_initiation_date, data.iskcon_first_contact_date, data.second_initiated, data.second_initiation_date,
    data.full_time_devotee, data.temple_name, data.status, data.facilitator_id
  ];
  await workbook.xlsx.writeFile(PUBLIC_XLS_PATH);
  console.log('[publicDevotee] Appended new row to XLS for:', data.email);
}

// 🔹 Add Public Devotee Entry
router.post('/public', upload.single('photo'), async (req, res) => {
  console.log('[publicDevotee] POST /public called');
  try {
    const data = req.body;
    console.log('[publicDevotee] Received data:', data);
    // Set default facilitator_id to 0 if not provided
    if (!data.facilitator_id) data.facilitator_id = 0;
    if (req.file) {
      data.photo_path = `/uploads/public-photo/${req.file.filename}`;
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