const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const LIVING_LABELS = {
  both_parents: 'پدر و مادر',
  father_only: 'فقط پدر',
  mother_only: 'فقط مادر',
  other: 'سایر',
};

const HEADERS = [
  'ردیف',
  'نام دانش‌آموز',
  'نام پدر',
  'تاریخ تولد',
  'کد ملی',
  'معدل ترم اول',
  'تلفن منزل',
  'موبایل پدر',
  'موبایل مادر',
  'شرایط زندگی',
  'توضیحات شرایط زندگی',
  'مدرسه قبلی',
  'آدرس منزل',
  'تاریخ ثبت',
];

function formatLivingWith(registration) {
  if (registration.living_with === 'other' && registration.other_living_details) {
    return 'سایر';
  }
  return LIVING_LABELS[registration.living_with] || registration.living_with;
}

function registrationToRow(registration, index) {
  return [
    index + 1,
    registration.full_name,
    registration.father_name,
    registration.birth_date,
    registration.national_code,
    registration.first_term_grade,
    registration.home_phone,
    registration.father_mobile,
    registration.mother_mobile,
    formatLivingWith(registration),
    registration.other_living_details || '',
    registration.previous_school || '',
    registration.home_address,
    registration.created_at,
  ];
}

function buildWorkbook(registrations) {
  const rows = [
    HEADERS,
    ...registrations.map((r, i) => registrationToRow(r, i)),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 20 },
    { wch: 36 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ثبت‌نام‌ها');
  return workbook;
}

function buildWorkbookBuffer(registrations) {
  const workbook = buildWorkbook(registrations);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

function exportFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `registrations-${date}.xlsx`;
}

function writeRegistrationsExcel(registrations, outputPath) {
  const workbook = buildWorkbook(registrations);
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  XLSX.writeFile(workbook, outputPath);
  return outputPath;
}

module.exports = {
  buildWorkbookBuffer,
  exportFilename,
  writeRegistrationsExcel,
};
