#!/usr/bin/env node
const path = require('path');
const { getAllRegistrations } = require('../server/db');
const { writeRegistrationsExcel } = require('../server/export/excel');

const defaultOutput = path.join(__dirname, '..', 'data', 'registrations.xlsx');
const outputPath = path.resolve(process.argv[2] || defaultOutput);

const registrations = getAllRegistrations();
writeRegistrationsExcel(registrations, outputPath);

console.log(`Exported ${registrations.length} registration(s) to:\n${outputPath}`);
