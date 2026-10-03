import assert from 'node:assert/strict';
import * as v from '../src/utils/validators.js';
import * as e from '../src/utils/emiCalculator.js';
import * as f from '../src/utils/formatters.js';
import { isCoApplicantRequired } from '../src/utils/stepLogic.js';
import { getRequiredDocuments } from '../src/utils/documentRules.js';

import { test } from 'vitest';
const t = (name, fn) => test(name, fn);
let n = 0;

// Verhoeff: well-known test vector 236 -> check digit 3
t('verhoeff known vector', () => { assert.equal(v.verhoeffGenerate('236'), 3); assert.ok(v.verhoeffValidate('2363')); assert.ok(!v.verhoeffValidate('2364')); });
t('aadhaar generated valid', () => { const base = '23456789012'; const a = base + v.verhoeffGenerate(base); assert.ok(v.validateAadhaar(a).valid, a); });
t('aadhaar bad checksum', () => { const base = '23456789012'; const c = v.verhoeffGenerate(base); const bad = base + ((c + 1) % 10); assert.match(v.validateAadhaar(bad).message, /checksum/); });
t('aadhaar length', () => assert.match(v.validateAadhaar('12345').message, /12 digits/));

t('PAN ok individual', () => assert.ok(v.validatePAN('ABCPE1234F', 'personal').valid));
t('PAN spec edge case ABCDE1234F', () => assert.match(v.validatePAN('ABCDE1234F', 'personal').message, /4th character must indicate entity type/));
t('PAN format', () => assert.match(v.validatePAN('ABC12', 'personal').message, /AAAAA9999A/));
t('PAN company rejected for personal', () => assert.equal(v.validatePAN('ABCCE1234F', 'personal').valid, false));
t('PAN company ok for business', () => assert.ok(v.validatePAN('ABCCE1234F', 'business').valid));
t('PAN HUF rejected for business', () => assert.equal(v.validatePAN('ABCHE1234F', 'business').valid, false));

t('GST known-valid sample', () => assert.ok(v.validateGST('27AAPFU0939F1ZV').valid, v.validateGST('27AAPFU0939F1ZV').message));
t('GST wrong checksum', () => assert.match(v.validateGST('27AAPFU0939F1ZW').message, /checksum/));
t('GST bad state code', () => assert.equal(v.validateGST('99AAPFU0939F1ZV').valid, false));

const day = (d) => new Date(2026, 9, 3 + d);
t('age exactly 21 today accepted', () => assert.equal(v.calculateAge('2005-10-03', new Date(2026, 9, 3)), 21));
t('age 20y364d rejected (still 20)', () => assert.equal(v.calculateAge('2005-10-04', new Date(2026, 9, 3)), 20));
t('leap-day birthday', () => assert.equal(v.calculateAge('2004-02-29', new Date(2025, 1, 28)), 20));
t('impossible date', () => assert.equal(v.parseISODate('2000-02-31'), null));
t('max tenure for age 40 = 300 months', () => assert.equal(v.maxTenureForAge(40), 300));

t('EMI 10L @10.5% 60m ≈ 21494', () => assert.equal(Math.round(e.calculateEMI(1000000, 10.5, 60)), 21494));
t('summary total cost = emi*n - P', () => { const s = e.buildLoanSummary({ loanType: 'personal', loanAmount: 1000000, loanTenure: 60 }); assert.equal(s.totalCostOfBorrowing, s.emi * 60 - 1000000); assert.equal(s.processingFee, 10000); });
t('processing fee min/max', () => { assert.equal(e.calculateProcessingFee(50000), 2000); assert.equal(e.calculateProcessingFee(10000000), 25000); });
t('affordability 50% boundary', () => { assert.equal(e.checkAffordability({ emi: 5000, income: 10000 }).exceeds, false); assert.equal(e.checkAffordability({ emi: 5001, income: 10000 }).exceeds, true); assert.equal(e.checkAffordability({ emi: 9000, income: 10000, coApplicantIncome: 10000 }).exceeds, false); });

t('Indian formatting', () => { assert.equal(f.formatIndianNumber(1050000), '10,50,000'); assert.equal(f.formatINR(10000000), '₹1,00,00,000'); assert.equal(f.parseIndianNumber('₹10,50,000'), 1050000); assert.equal(f.maskValue('123456789012'), '••••••••9012'); });

t('step 6: exactly 5,00,000 personal NOT shown', () => assert.equal(isCoApplicantRequired({ loanType: 'personal', loanAmount: 500000 }), false));
t('step 6: 5,00,001 personal shown', () => assert.equal(isCoApplicantRequired({ loanType: 'personal', loanAmount: 500001 }), true));
t('step 6: home always', () => assert.equal(isCoApplicantRequired({ loanType: 'home', loanAmount: 100000 }), true));
t('step 6: business 20L not, 20L+1 yes', () => { assert.equal(isCoApplicantRequired({ loanType: 'business', loanAmount: 2000000 }), false); assert.equal(isCoApplicantRequired({ loanType: 'business', loanAmount: 2000001 }), true); });

t('docs: salaried personal', () => { const ids = getRequiredDocuments({ loanType: 'personal', employmentType: 'salaried' }).map((d) => d.id); assert.ok(ids.includes('salary') && !ids.includes('itr') && !ids.includes('property')); });
t('docs: business owner', () => { const ids = getRequiredDocuments({ loanType: 'business', employmentType: 'business_owner' }).map((d) => d.id); assert.ok(ids.includes('itr') && ids.includes('gstReturns') && ids.includes('bizReg') && !ids.includes('salary')); });
t('docs: PAN optional when verified', () => assert.equal(getRequiredDocuments({ panVerified: true }).find((d) => d.id === 'pan').required, false));

