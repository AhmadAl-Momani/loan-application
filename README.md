# LendSwift multi-step loan application (starter)

React 18 + Vite + React Hook Form + Zod + Tailwind. Built from the ZeTheta brief.

## Run it
```
npm install
npm run dev        # http://localhost:5173
npm test           # vitest: validators, EMI, step logic, document rules
npm run lint
npm run test:e2e   # Cypress (no specs written yet)
```

## Status
| Area | State |
|---|---|
| Wizard (step registry, live Step 6 visibility, rapid-click lock, focus on step change) | Done |
| Steps 1, 2, 3 (loan, personal, KYC with simulated PAN/Aadhaar verification) | Done |
| Step 8 (key fact statement, EMI, 50% affordability warning, 4 consents, success modal with UUID) | Done, no document gate or e-signature display yet |
| Steps 4, 5, 6, 7 | Placeholder UI. **Schemas, hooks and rules are done** (`step4/5/6Schema.js`, `usePinCodeLookup`, `documentRules.js`) |
| Encrypted auto-save + resume/start-fresh + 72h TTL + tamper detection | Done |
| Common components (Input compound, Select, RadioGroup, Checkbox, CurrencyInput, MaskedInput, ErrorMessage) | Done |
| FileUpload + compression, SignatureCanvas | Not started |
| Cypress specs (15 required) | Not started |
| `pinCodeData.json` | 12 PINs; the brief wants 100+ covering all states/UTs |

## Architecture notes
- **One RHF instance, per-step schema.** The resolver in `Wizard.jsx` calls `getStepSchema(currentStep, values)` on every validation, so cross-step rules always see the latest answers (DOB → tenure cap, loan type → allowed PAN entity types, loan type → employment rules).
- **Steps 4–7 are not validated yet** (`implemented: false` in `stepRegistry.jsx`) so you can walk the whole flow. Flip the flag as you build each step.
- **Step 6** is computed from `isCoApplicantRequired` (strictly *exceeds*: ₹5,00,000 exactly does not trigger it).
- **Auto-save** is debounced per the spec: it fires 30s after the last change. Files are not persisted.
- **Colour contrast:** the brand green `#27AE60` and red `#E74C3C` fail 4.5:1 on white, so text uses darker `accent-dark` / `error-dark` variants (`tailwind.config.js`).

## Known gaps / decisions to make
- Brief conflict: Section B3 says EMI "must not exceed" 50% of income, Step 8/Day 9 says warn but allow with extra consent. This starter warns only.
- The directory layout in Section C1 was blank in the PDF, so this layout is inferred.
- Hardcoded AES passphrase is allowed by the brief for this project only.
- Not yet run through `npm install` / `vite build` / ESLint (no network in the authoring environment). Expect small fixes.
