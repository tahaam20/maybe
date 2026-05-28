const express = require('express');
const { createRegistration, getAllRegistrations, getRegistrationCount } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { buildWorkbookBuffer, exportFilename } = require('../export/excel');

const router = express.Router();

const LIVING_WITH_VALUES = new Set([
  'both_parents',
  'father_only',
  'mother_only',
  'other',
]);

function validateRegistration(body) {
  const errors = [];

  const required = [
    'full_name',
    'father_name',
    'birth_date',
    'national_code',
    'first_term_grade',
    'home_phone',
    'father_mobile',
    'mother_mobile',
    'home_address',
    'living_with',
  ];

  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      errors.push(`فیلد ${field} الزامی است.`);
    }
  }

  const nationalCode = String(body.national_code || '').trim();
  if (!/^\d{10}$/.test(nationalCode)) {
    errors.push('کد ملی باید ۱۰ رقم باشد.');
  }

  const phoneRegex = /^09\d{9}$/;
  if (!phoneRegex.test(String(body.father_mobile || '').trim())) {
    errors.push('شماره همراه پدر نامعتبر است.');
  }
  if (!phoneRegex.test(String(body.mother_mobile || '').trim())) {
    errors.push('شماره همراه مادر نامعتبر است.');
  }

  const grade = parseFloat(body.first_term_grade);
  if (Number.isNaN(grade) || grade < 10 || grade > 20) {
    errors.push('معدل باید بین ۱۰ تا ۲۰ باشد.');
  }

  if (!LIVING_WITH_VALUES.has(body.living_with)) {
    errors.push('گزینه شرایط زندگی نامعتبر است.');
  }

  if (body.living_with === 'other' && !String(body.other_living_details || '').trim()) {
    errors.push('در صورت انتخاب «سایر»، توضیحات الزامی است.');
  }

  return { errors, nationalCode, grade };
}

router.post('/', (req, res) => {
  const { errors, nationalCode, grade } = validateRegistration(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0], errors });
  }

  try {
    const registration = createRegistration({
      full_name: String(req.body.full_name).trim(),
      father_name: String(req.body.father_name).trim(),
      birth_date: String(req.body.birth_date).trim(),
      national_code: nationalCode,
      previous_school: String(req.body.previous_school || '').trim() || null,
      first_term_grade: grade,
      home_phone: String(req.body.home_phone).trim(),
      father_mobile: String(req.body.father_mobile).trim(),
      mother_mobile: String(req.body.mother_mobile).trim(),
      home_address: String(req.body.home_address).trim(),
      living_with: req.body.living_with,
      other_living_details:
        req.body.living_with === 'other'
          ? String(req.body.other_living_details).trim()
          : null,
    });

    res.status(201).json({
      message: 'ثبت‌نام با موفقیت انجام شد.',
      id: registration.id,
    });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        error: 'این کد ملی قبلاً ثبت شده است.',
      });
    }
    console.error(err);
    res.status(500).json({ error: 'خطا در ذخیره اطلاعات.' });
  }
});

router.get('/export', requireAdmin, (req, res) => {
  const registrations = getAllRegistrations();
  const buffer = buildWorkbookBuffer(registrations);
  const filename = exportFilename();

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  );
  res.send(buffer);
});

router.get('/', requireAdmin, (req, res) => {
  const registrations = getAllRegistrations();
  res.json({
    count: getRegistrationCount(),
    registrations,
  });
});

module.exports = router;
