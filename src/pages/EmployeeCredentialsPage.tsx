import React from 'react';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { Input } from '../components/Input';
import { GenerateButton } from '../components/GenerateButton';
import {
  AADHAAR_DIGITS_MAX,
  digitsOnlyMax,
  MOBILE_DIGITS_MAX,
  sanitizePan,
  sanitizeTan,
  ZIP_DIGITS_MAX,
} from '../utils/inputFormats';

const FIELD_CLASSES =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';

type CredentialsForm = {
  pan: string;
  employeeName: string;
  mobile: string;
  email: string;
  aadhaar: string;
  empCode: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  state: string;
  gender: string;
  yearlyCtc: string;
  department: string;
  designation: string;
  bankName: string;
  ifscCode: string;
  bankAccountNumber: string;
  medicalInsuranceNo: string;
  doj: string;
  doc: string;
  centreName: string;
  confirmationStatus: string;
  monthlyLeaves: string;
  nps: string;
  esi: string;
  jobGrade: string;
  uan: string;
  pf: string;
  remarks: string;
  status: string;
  exitDate: string;
  basicSalary: string;
  hra: string;
  lta: string;
  medicalAllowance: string;
  cea: string;
  foodAllowance: string;
  supplementaryAllowance: string;
  mea: string;
  pTax: string;
  healthInsurance: string;
  esiSalary: string;
  pfContribution: string;
  npsEmployer: string;
  npsEmployee: string;
  roundOff: string;
  ctcMonthly: string;
  ctcPerDay: string;
  gratuity: string;
};

type ReferenceForm = {
  name: string;
  mobile: string;
  designation: string;
  city: string;
};

type ThirdPartyCredentialsForm = {
  department: string;
  name: string;
  aadharNo: string;
  mobileNo: string;
  email: string;
  panNo: string;
  tanNo: string;
  passportNo: string;
  gender: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  country: string;
  state: string;
  threePCompanyName: string;
  threePEmplCode: string;
  threePEntity: string;
  businessCode: string;
  branchCode: string;
  gstTaxNo: string;
  bankName: string;
  ifscCode: string;
  bankAccountNumber: string;
  swiftNo: string;
  ibanNo: string;
  doj: string;
  ira: string;
  remarks: string;
  status: string;
  exitDate: string;
  verifiedStatus: string;
  businessDeposit: string;
  sharingThreeP: string;
  sharingBlaunk: string;
};

const emptyCredentials: CredentialsForm = {
  pan: '',
  employeeName: '',
  mobile: '',
  email: '',
  aadhaar: '',
  empCode: '',
  address: '',
  city: '',
  zip: '',
  country: '',
  state: '',
  gender: '',
  yearlyCtc: '',
  department: '',
  designation: '',
  bankName: '',
  ifscCode: '',
  bankAccountNumber: '',
  medicalInsuranceNo: '',
  doj: '',
  doc: '',
  centreName: '',
  confirmationStatus: '',
  monthlyLeaves: '',
  nps: '',
  esi: '',
  jobGrade: '',
  uan: '',
  pf: '',
  remarks: '',
  status: '',
  exitDate: '',
  basicSalary: '',
  hra: '',
  lta: '',
  medicalAllowance: '',
  cea: '',
  foodAllowance: '',
  supplementaryAllowance: '',
  mea: '',
  pTax: '',
  healthInsurance: '',
  esiSalary: '',
  pfContribution: '',
  npsEmployer: '',
  npsEmployee: '',
  roundOff: '',
  ctcMonthly: '0.00',
  ctcPerDay: '',
  gratuity: '',
};

const emptyThirdPartyCredentials: ThirdPartyCredentialsForm = {
  department: '',
  name: '',
  aadharNo: '',
  mobileNo: '',
  email: '',
  panNo: '',
  tanNo: '',
  passportNo: '',
  gender: '',
  address1: '',
  address2: '',
  city: '',
  zip: '',
  country: '',
  state: '',
  threePCompanyName: '',
  threePEmplCode: '',
  threePEntity: '',
  businessCode: '',
  branchCode: '',
  gstTaxNo: '',
  bankName: '',
  ifscCode: '',
  bankAccountNumber: '',
  swiftNo: '',
  ibanNo: '',
  doj: '',
  ira: '',
  remarks: '',
  status: '',
  exitDate: '',
  verifiedStatus: '',
  businessDeposit: '',
  sharingThreeP: '0',
  sharingBlaunk: '100',
};

const FINANCIAL_YEARS = Array.from({ length: 2100 - 2024 + 1 }, (_, i) => 2024 + i);

export const EmployeeCredentialsPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'credentials' | 'vacancy' | 'mis' | 'upload' | 'thirdParty'>(
    'credentials',
  );
  const [searchPan, setSearchPan] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [form, setForm] = React.useState<CredentialsForm>(emptyCredentials);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [references, setReferences] = React.useState<ReferenceForm[]>([
    { name: '', mobile: '', designation: '', city: '' },
    { name: '', mobile: '', designation: '', city: '' },
  ]);
  const [employeePhotoPreview, setEmployeePhotoPreview] = React.useState<string | null>(null);
  const [employeeDocumentName, setEmployeeDocumentName] = React.useState<string | null>(null);
  const [employeeDocumentUrl, setEmployeeDocumentUrl] = React.useState<string | null>(null);
  const [vacancyDepartment, setVacancyDepartment] = React.useState('');
  const [vacancyPost, setVacancyPost] = React.useState('');
  const [vacancyExperience, setVacancyExperience] = React.useState('');
  const [vacancySkill, setVacancySkill] = React.useState('');
  const [vacancyLocation, setVacancyLocation] = React.useState('');
  const [vacancyQualification, setVacancyQualification] = React.useState('');
  const [vacancyAgeGroup, setVacancyAgeGroup] = React.useState('');
  const [vacancyCount, setVacancyCount] = React.useState('');
  const [vacancyCtc, setVacancyCtc] = React.useState('');
  const [misFinancialYear, setMisFinancialYear] = React.useState('');
  const [misMonth, setMisMonth] = React.useState('');
  const [misDepartment, setMisDepartment] = React.useState('Payroll');
  const [misReportType, setMisReportType] = React.useState('Monthly D');
  const [misPeriod, setMisPeriod] = React.useState('Monthly');
  const [misStatus, setMisStatus] = React.useState('Active');
  const [misFormat, setMisFormat] = React.useState('Excel');
  const [uploadMonthSalaryDay, setUploadMonthSalaryDay] = React.useState('25/01');
  const [uploadMonthSalaryYear, setUploadMonthSalaryYear] = React.useState('2025');
  const [uploadMonthSalaryMonth, setUploadMonthSalaryMonth] = React.useState('January');
  const [uploadMonthSalaryStatus, setUploadMonthSalaryStatus] = React.useState('New');
  const [uploadMonthSalaryFileName, setUploadMonthSalaryFileName] = React.useState<string | null>(null);
  const [uploadInvestDeclarationDay, setUploadInvestDeclarationDay] = React.useState('25/001');
  const [uploadInvestDeclarationYear, setUploadInvestDeclarationYear] = React.useState('2025');
  const [uploadInvestDeclarationMonth, setUploadInvestDeclarationMonth] = React.useState('January');
  const [uploadInvestDeclarationStatus, setUploadInvestDeclarationStatus] = React.useState('New');
  const [uploadInvestDeclarationFileName, setUploadInvestDeclarationFileName] = React.useState<string | null>(null);
  /** Which upload row is being edited (label matches row); null = view mode */
  const [uploadEditingLabel, setUploadEditingLabel] = React.useState<string | null>(null);
  const [uploadSectionMessage, setUploadSectionMessage] = React.useState<string | null>(null);
  const [thirdPartyForm, setThirdPartyForm] =
    React.useState<ThirdPartyCredentialsForm>(emptyThirdPartyCredentials);
  const [thirdPartyReferences, setThirdPartyReferences] = React.useState<ReferenceForm[]>([
    { name: '', mobile: '', designation: '', city: '' },
    { name: '', mobile: '', designation: '', city: '' },
  ]);
  const [thirdPartyEmployeePhoto, setThirdPartyEmployeePhoto] = React.useState<string | null>(null);
  const [thirdPartyChqImage, setThirdPartyChqImage] = React.useState<string | null>(null);
  const [thirdPartyPanImage, setThirdPartyPanImage] = React.useState<string | null>(null);
  const [isEditingThirdParty, setIsEditingThirdParty] = React.useState(false);
  const [statusMessageThirdParty, setStatusMessageThirdParty] = React.useState<string | null>(null);

  const updateField = (key: keyof CredentialsForm, value: string) => {
    let finalValue = value;
    const salaryFields = [
      'basicSalary', 'hra', 'lta', 'medicalAllowance', 'cea', 'foodAllowance',
      'supplementaryAllowance', 'mea', 'pTax', 'healthInsurance', 'esiSalary',
      'pfContribution', 'npsEmployer', 'roundOff', 'ctcMonthly', 'ctcPerDay',
      'npsEmployee', 'gratuity'
    ];
    if (salaryFields.includes(key as string)) {
      finalValue = value.replace(/[^0-9]/g, '');
    }

    setForm((previous) => {
      const next = { ...previous, [key]: finalValue };

      const ctcFields = [
        'basicSalary', 'hra', 'lta', 'medicalAllowance', 'cea', 'foodAllowance',
        'supplementaryAllowance', 'mea', 'pTax', 'healthInsurance',
        'esiSalary', 'pfContribution', 'npsEmployer', 'roundOff'
      ];
      if (ctcFields.includes(key as string)) {
        const ctc = ctcFields.reduce((sum, f) => {
          const val = parseFloat(next[f as keyof CredentialsForm] as string) || 0;
          return sum + val;
        }, 0);
        next.ctcMonthly = ctc.toString();
      }

      return next;
    });
  };

  const updateReferenceField = (index: number, key: keyof ReferenceForm, value: string) => {
    setReferences((previous) =>
      previous.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  const updateThirdPartyField = (key: keyof ThirdPartyCredentialsForm, value: string) => {
    setThirdPartyForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const updateThirdPartyReferenceField = (index: number, key: keyof ReferenceForm, value: string) => {
    setThirdPartyReferences((previous) =>
      previous.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchPan) {
      setStatusMessage('Please enter PAN to search.');
      return;
    }

    try {
      setForm({ ...emptyCredentials, pan: searchPan.toUpperCase() });
      setReferences([
        { name: '', mobile: '', designation: '', city: '' },
        { name: '', mobile: '', designation: '', city: '' },
      ]);
      setEmployeeDocumentName(null);
      setEmployeeDocumentUrl(null);
      setStatusMessage('No server: blank form for this PAN. Enter details and save (local only).');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load employee credentials', error);
      setStatusMessage('Failed to load employee credentials.');
    }
  };

  const handleSave = async () => {
    if (!form.pan) {
      setStatusMessage('PAN is required before saving.');
      return;
    }

    try {
      setIsEditing(false);
      setStatusMessage('Employee credentials saved locally (no server).');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save employee credentials', error);
      setStatusMessage('Failed to save employee credentials.');
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      {/* Inner tabs */}
      <Tabs
        tabs={[
          { id: 'credentials', label: 'Credentials' },
          { id: 'vacancy', label: 'Vacancy' },
          { id: 'mis', label: 'MIS' },
          { id: 'upload', label: 'Upload' },
          { id: 'thirdParty', label: '3P-Credentials' },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      {activeTab === 'credentials' ? (
        <>
          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-xl items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 shadow-card"
          >
            <input
              type="text"
              value={searchPan}
              onChange={(event) => setSearchPan(sanitizePan(event.target.value))}
              placeholder="Search by PAN"
              className="flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white shadow-sm transition hover:bg-primary-dark"
              aria-label="Search"
            >
              🔍
            </button>
          </form>

          {/* Header with actions */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-primary">Employee Credentials</h1>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(true);
                  setStatusMessage(null);
                }}
                disabled={isEditing}
              >
                Edit
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isEditing}
              >
                Save
              </Button>
            </div>
          </div>

          {statusMessage ? <p className="text-sm text-slate-700">{statusMessage}</p> : null}

          {/* Form grid */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
            <fieldset
              disabled={!isEditing}
              className="space-y-6 [&:disabled_input]:bg-slate-50 [&:disabled_select]:bg-slate-50 [&:disabled_input]:cursor-not-allowed [&:disabled_select]:cursor-not-allowed"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Row 1 */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Employee Name</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Employee Name"
                    value={form.employeeName}
                    onChange={(event) => updateField('employeeName', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Mobile No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Mobile No."
                    value={form.mobile}
                    onChange={(event) =>
                      updateField('mobile', digitsOnlyMax(event.target.value, MOBILE_DIGITS_MAX))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">PAN Card No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="PAN Card No."
                    value={form.pan}
                    onChange={(event) => updateField('pan', sanitizePan(event.target.value))}
                  />
                </div>

                {/* Row 2 */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Aadhaar No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Aadhaar No."
                    value={form.aadhaar}
                    onChange={(event) =>
                      updateField('aadhaar', digitsOnlyMax(event.target.value, AADHAAR_DIGITS_MAX))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Address</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Address"
                    value={form.address}
                    onChange={(event) => updateField('address', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">City</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="City"
                    value={form.city}
                    onChange={(event) => updateField('city', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Yearly CTC</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="CTC"
                    value={form.yearlyCtc}
                    onChange={(event) => updateField('yearlyCtc', event.target.value)}
                  />
                </div>

                {/* Row 3 */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">ZIP/PIN Code</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="ZIP/PIN Code"
                    value={form.zip}
                    onChange={(event) =>
                      updateField('zip', digitsOnlyMax(event.target.value, ZIP_DIGITS_MAX))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Country</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.country}
                    onChange={(event) => updateField('country', event.target.value)}
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Thailand">Thailand</option>
                    <option value="UAE-Dubai">UAE-Dubai</option>
                    <option value="Vietnam">Vietnam</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">State</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.state}
                    disabled
                    onChange={(event) => updateField('state', event.target.value)}
                  >
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Gender</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.gender}
                    onChange={(event) => updateField('gender', event.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Row 4 — Department, Designation & EMP Code grouped */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Department</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.department}
                    onChange={(event) => updateField('department', event.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="Management">Management</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                    <option value="M&A">M&A</option>
                    <option value="Customer Care">Customer Care</option>
                    <option value="Admin & Personnel">Admin & Personnel</option>
                    <option value="IT">IT</option>
                    <option value="DSA">DSA</option>
                    <option value="Legal">Legal</option>
                    <option value="Sales">Sales</option>
                    <option value="Retail Store">Retail Store</option>
                    <option value="Company Secretary">Company Secretary</option>
                    <option value="RETAIL MANAGEMENT">RETAIL MANAGEMENT</option>
                    <option value="Verifier">Verifier</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Designation</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.designation}
                    onChange={(event) => updateField('designation', event.target.value)}
                  >
                    <option value="">Select Designation</option>
                    <option value="Chairman">Chairman</option>
                    <option value="CMD">CMD</option>
                    <option value="MD">MD</option>
                    <option value="Director">Director</option>
                    <option value="CEO">CEO</option>
                    <option value="CFO">CFO</option>
                    <option value="Country Head">Country Head</option>
                    <option value="President">President</option>
                    <option value="V.P">V.P</option>
                    <option value="A.V.P">A.V.P</option>
                    <option value="Zonal Head">Zonal Head</option>
                    <option value="Sr. Manager">Sr. Manager</option>
                    <option value="Manager">Manager</option>
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Sr. Executive">Sr. Executive</option>
                    <option value="Executive">Executive</option>
                    <option value="Clerical">Clerical</option>
                    <option value="Team Leader">Team Leader</option>
                    <option value="Field Staff">Field Staff</option>
                    <option value="Security">Security</option>
                    <option value="Outsourcing">Outsourcing</option>
                    <option value="Office Peon">Office Peon</option>
                    <option value="Front Desk">Front Desk</option>
                    <option value="Reception">Reception</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Area Manager">Area Manager</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">EMP Code</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Employee Code"
                    value={form.empCode}
                    maxLength={10}
                    onChange={(event) => updateField('empCode', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Bank Name</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Bank Name"
                    value={form.bankName}
                    onChange={(event) => updateField('bankName', event.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  />
                </div>

                {/* Row 5 */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">IFSC Code</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter IFSC Code"
                    value={form.ifscCode}
                    maxLength={11}
                    onChange={(event) => updateField('ifscCode', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Bank Account No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Bank Account No."
                    value={form.bankAccountNumber}
                    maxLength={18}
                    onChange={(event) => updateField('bankAccountNumber', event.target.value.replace(/[^0-9]/g, '').slice(0, 18))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Medical Insurance No.
                  </label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Medical Insurance No."
                    value={form.medicalInsuranceNo}
                    onChange={(event) => updateField('medicalInsuranceNo', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">D.O.J</label>
                  <input
                    type="date"
                    className={FIELD_CLASSES}
                    value={form.doj}
                    onChange={(event) => updateField('doj', event.target.value)}
                  />
                </div>

                {/* Row 6 */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Centre Name</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Centre Name"
                    value={form.centreName}
                    onChange={(event) => updateField('centreName', event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Confirmation Status</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.confirmationStatus}
                    onChange={(event) => updateField('confirmationStatus', event.target.value)}
                  >
                    <option value="">Select Confirmation Status</option>
                    <option value="Not Approved">Not Approved</option>
                    <option value="Approved">Approved</option>
                    <option value="Extension">Extension</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">D.O.C</label>
                  <input
                    type="date"
                    className={FIELD_CLASSES}
                    value={form.doc}
                    onChange={(event) => updateField('doc', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Job Grade</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.jobGrade}
                    onChange={(event) => updateField('jobGrade', event.target.value)}
                  >
                    <option value="">Select Job Grade</option>
                    <option value="L">L</option>
                  </select>
                </div>

                {/* Row 7 */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Monthly Leaves</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.monthlyLeaves}
                    onChange={(event) => updateField('monthlyLeaves', event.target.value)}
                  >
                    <option value="">Select Monthly Leaves</option>
                    <option value="0">0</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">NPS</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter number"
                    value={form.nps}
                    maxLength={12}
                    onChange={(event) => updateField('nps', event.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">U.A.N</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter U.A.N"
                    value={form.uan}
                    onChange={(event) => updateField('uan', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">PF</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter PF"
                    value={form.pf}
                    maxLength={15}
                    onChange={(event) => updateField('pf', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))}
                  />
                </div>

                {/* Row 8 */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">ESI</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter ESI"
                    value={form.esi}
                    maxLength={15}
                    onChange={(event) => updateField('esi', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Remarks</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.remarks}
                    onChange={(event) => updateField('remarks', event.target.value)}
                  >
                    <option value="">Select Remarks</option>
                    <option value="FNF">FNF</option>
                    <option value="On Hold">On Hold</option>
                    <option value="No Objection">No Objection</option>
                    <option value="Issue Pending">Issue Pending</option>
                    <option value="Legal Issue">Legal Issue</option>
                    <option value="Penalty">Penalty</option>
                    <option value="Fraud Case">Fraud Case</option>
                    <option value="Black Mark">Black Mark</option>
                    <option value="Documents Pending">Documents Pending</option>
                    <option value="Uninformed Left">Uninformed Left</option>
                    <option value="No reporting on joining">No reporting on joining</option>
                    <option value="Verification Pending">Verification Pending</option>
                    <option value="Management approved for leaving">Management approved for leaving</option>
                    <option value="Management approved for rejoining">Management approved for rejoining</option>
                    <option value="No Notice Period">No Notice Period</option>
                    <option value="On Notice Period">On Notice Period</option>
                    <option value="PF Issue">PF Issue</option>
                    <option value="ESI Issue">ESI Issue</option>
                    <option value="Offer Letter Issue">Offer Letter Issue</option>
                    <option value="PF and ESI Pending">PF and ESI Pending</option>
                    <option value="Gratuity Pending">Gratuity Pending</option>
                    <option value="Merge PF">Merge PF</option>
                    <option value="Handover Pending">Handover Pending</option>
                    <option value="Relieving Letter On Hold">Relieving Letter On Hold</option>
                    <option value="Referral Issue">Referral Issue</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    className={FIELD_CLASSES}
                    value={form.status}
                    onChange={(event) => updateField('status', event.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Exit">Exit</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Exit Date</label>
                  <input
                    type="date"
                    className={FIELD_CLASSES}
                    value={form.exitDate}
                    disabled
                    onChange={(event) => updateField('exitDate', event.target.value)}
                  />
                </div>
              </div>

              {/* Reference section */}
              <div className="mt-8 space-y-3">
                <h2 className="text-lg font-semibold text-primary">Reference</h2>

                {[0, 1].map((index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-3 md:grid-cols-4"
                  >
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Name
                      </label>
                      <input
                        className={FIELD_CLASSES}
                        placeholder="Name"
                        value={references[index]?.name ?? ''}
                        onChange={(event) =>
                          updateReferenceField(index, 'name', event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Mobile No.
                      </label>
                      <input
                        className={FIELD_CLASSES}
                        placeholder="Mobile"
                        value={references[index]?.mobile ?? ''}
                        onChange={(event) =>
                          updateReferenceField(
                            index,
                            'mobile',
                            digitsOnlyMax(event.target.value, MOBILE_DIGITS_MAX),
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Designation
                      </label>
                      <select
                        className={FIELD_CLASSES}
                        value={references[index]?.designation ?? ''}
                        onChange={(event) =>
                          updateReferenceField(index, 'designation', event.target.value)
                        }
                      >
                        <option value="">Select Designation</option>
                        <option value="Manager">Manager</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        City
                      </label>
                      <input
                        className={FIELD_CLASSES}
                        placeholder="City"
                        value={references[index]?.city ?? ''}
                        onChange={(event) =>
                          updateReferenceField(index, 'city', event.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Salary Structure */}
              <div className="mt-10 space-y-4">
                <h2 className="text-lg font-semibold text-primary">Salary Structure</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Row 1 */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Basic Salary</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="Basic Salary"
                      value={form.basicSalary}
                      onChange={(event) => updateField('basicSalary', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">HRA</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="HRA"
                      value={form.hra}
                      onChange={(event) => updateField('hra', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">LTA</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="LTA"
                      value={form.lta}
                      onChange={(event) => updateField('lta', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Med. Allowance</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="Medical Allowance"
                      value={form.medicalAllowance}
                      onChange={(event) => updateField('medicalAllowance', event.target.value)}
                    />
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      CEA (Education)
                    </label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="CEA"
                      value={form.cea}
                      onChange={(event) => updateField('cea', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Food Allowance</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="Food Allowance"
                      value={form.foodAllowance}
                      onChange={(event) => updateField('foodAllowance', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Sup. Allowance
                    </label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="Supplementary Allowance"
                      value={form.supplementaryAllowance}
                      onChange={(event) => updateField('supplementaryAllowance', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      MEA (Miscellaneous)
                    </label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="MEA"
                      value={form.mea}
                      onChange={(event) => updateField('mea', event.target.value)}
                    />
                  </div>

                  {/* Row 3 */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">P. Tax</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="P Tax"
                      value={form.pTax}
                      onChange={(event) => updateField('pTax', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Health Insurance</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="Health Insurance"
                      value={form.healthInsurance}
                      onChange={(event) => updateField('healthInsurance', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">ESI</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="ESI"
                      value={form.esiSalary}
                      onChange={(event) => updateField('esiSalary', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">PF Contribution</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="PF Contribution"
                      value={form.pfContribution}
                      onChange={(event) => updateField('pfContribution', event.target.value)}
                    />
                  </div>

                  {/* Row 4 */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      NPS (Employer)
                    </label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="NPS Employer amount"
                      value={form.npsEmployer}
                      onChange={(event) => updateField('npsEmployer', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Round Off</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="Round Off"
                      value={form.roundOff}
                      onChange={(event) => updateField('roundOff', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">CTC - Monthly</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="CTC - Monthly"
                      value={form.ctcMonthly}
                      readOnly
                      onChange={(event) => updateField('ctcMonthly', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">CTC - Per Day</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="CTC - Per Day"
                      value={form.ctcPerDay}
                      onChange={(event) => updateField('ctcPerDay', event.target.value)}
                    />
                  </div>

                  {/* Row 5 */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      NPS (Employee)
                    </label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="NPS Employee amount"
                      value={form.npsEmployee}
                      onChange={(event) => updateField('npsEmployee', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Gratuity</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="Gratuity"
                      value={form.gratuity}
                      onChange={(event) => updateField('gratuity', event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Documents (always clickable, not disabled) */}
            <div className="mt-10 space-y-4">
              <h2 className="text-lg font-semibold text-primary">Documents</h2>
              <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[240px,minmax(0,1fr)]">
                {/* Employee Photo */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Employee Photo</p>
                  <label className="flex h-40 w-32 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-red-400 bg-yellow-50 text-[10px] text-red-600 shadow-sm">
                    <span className="mb-1 w-full text-center text-xs font-semibold text-slate-700">
                      {employeePhotoPreview ? 'Image' : 'Image'}
                    </span>
                    {employeePhotoPreview ? (
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img
                        src={employeePhotoPreview}
                        alt="Employee photo preview"
                        className="mt-1 h-24 w-24 rounded object-cover border border-slate-300"
                      />
                    ) : null}
                    <span className="mt-2 text-center text-[10px] text-red-600">
                      Click to upload (max: 200KB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (file.size > 200 * 1024) {
                          alert('Please select an image smaller than 200KB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          setEmployeePhotoPreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>

                {/* Employee Document */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Employee Document</p>
                  <input
                    type="file"
                    className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        setEmployeeDocumentName(null);
                        setEmployeeDocumentUrl(null);
                        return;
                      }

                      setEmployeeDocumentName(file.name);

                      try {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const url = typeof reader.result === 'string' ? reader.result : '';
                          setEmployeeDocumentUrl(url);
                          setStatusMessage('Document stored in browser for this session (no upload server).');
                        };
                        reader.onerror = () => {
                          setStatusMessage('Failed to read document file.');
                        };
                        reader.readAsDataURL(file);
                      } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error('Document read failed', error);
                        setStatusMessage('Failed to process employee document.');
                      }
                    }}
                  />
                  {employeeDocumentName ? (
                    <p className="text-xs text-slate-600">
                      Selected file: {employeeDocumentName}
                      {employeeDocumentUrl ? (
                        <>
                          {' '}
                          –{' '}
                          <a
                            href={employeeDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            View
                          </a>
                        </>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : activeTab === 'vacancy' ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6 max-w-3xl">
          <h2 className="mb-4 text-xl font-semibold text-primary">Department</h2>
          <div className="mb-6">
            <select
              className={FIELD_CLASSES}
              value={vacancyDepartment}
              onChange={(event) => setVacancyDepartment(event.target.value)}
            >
              <option value="">Select Department</option>
              <option value="Management">Management</option>
              <option value="Finance">Finance</option>
              <option value="M & A">M & A</option>
              <option value="Sales">Sales</option>
              <option value="Company Secretary">Company Secretary</option>
              <option value="HR">HR</option>
              <option value="Payslip">Payslip</option>
              <option value="IT Dept">IT Dept</option>
              <option value="Admin & Personnel">Admin & Personnel</option>
              <option value="Customer Care">Customer Care</option>
              <option value="Retail Shop">Retail Shop</option>
              <option value="DSA">DSA</option>
              <option value="Verifier">Verifier</option>
              <option value="RETAIL MANAGEMENT">RETAIL MANAGEMENT</option>
            </select>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Post', value: vacancyPost, onChange: setVacancyPost },
              { label: 'Experience', value: vacancyExperience, onChange: setVacancyExperience },
              { label: 'Skill', value: vacancySkill, onChange: setVacancySkill },
              { label: 'Location', value: vacancyLocation, onChange: setVacancyLocation },
              { label: 'Qualification', value: vacancyQualification, onChange: setVacancyQualification },
              { label: 'Age Group', value: vacancyAgeGroup, onChange: setVacancyAgeGroup },
              { label: 'No. of Vacancy', value: vacancyCount, onChange: setVacancyCount },
              { label: 'CTC', value: vacancyCtc, onChange: setVacancyCtc },
            ].map((field) => (
              <div
                key={field.label}
                className="grid grid-cols-[160px,minmax(0,1fr)] items-center gap-3"
              >
                <div className="text-sm font-semibold text-slate-700">{field.label}</div>
                <input
                  className={FIELD_CLASSES}
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-dark"
            >
              Save
            </button>
          </div>
        </section>
      ) : activeTab === 'mis' ? (
        <section className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
          <h2 className="mb-4 text-2xl font-semibold text-primary">MIS</h2>

          <div
            className="overflow-hidden rounded-t-xl bg-primary text-xs font-semibold uppercase tracking-wide text-white sm:text-sm"
            style={{ display: 'grid', gridTemplateColumns: 'minmax(5rem, 1fr) minmax(5rem, 1fr) minmax(6rem, 1fr) minmax(7rem, 1.2fr) minmax(5rem, 1fr) minmax(5rem, 1fr) minmax(6rem, 1fr) auto' }}
          >
            <div className="px-3 py-2.5 sm:px-4">Financial Year</div>
            <div className="px-3 py-2.5 sm:px-4">Month</div>
            <div className="px-3 py-2.5 sm:px-4">Department</div>
            <div className="px-3 py-2.5 sm:px-4">Report Type</div>
            <div className="px-3 py-2.5 sm:px-4">Period</div>
            <div className="px-3 py-2.5 sm:px-4">Status</div>
            <div className="px-3 py-2.5 sm:px-4">Output Format</div>
            <div className="px-3 py-2.5 text-right sm:px-4">Actions</div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              // eslint-disable-next-line no-console
              console.log({
                misFinancialYear,
                misMonth,
                misDepartment,
                misReportType,
                misPeriod,
                misStatus,
                misFormat,
              });
            }}
            className="grid gap-3 border border-t-0 border-slate-200 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4"
            style={{ gridTemplateColumns: 'minmax(5rem, 1fr) minmax(5rem, 1fr) minmax(6rem, 1fr) minmax(7rem, 1.2fr) minmax(5rem, 1fr) minmax(5rem, 1fr) minmax(6rem, 1fr) auto' }}
          >
            <select
              value={misFinancialYear}
              onChange={(event) => setMisFinancialYear(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select year</option>
              {FINANCIAL_YEARS.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>

            <select
              value={misMonth}
              onChange={(event) => setMisMonth(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="April">April</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
            </select>

            <select
              value={misDepartment}
              onChange={(event) => setMisDepartment(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select Department</option>
              <option value="Payroll">Payroll</option>
              <option value="HR - Credential">HR - Credential</option>
              <option value="3P - Credential">3P - Credential</option>
              <option value="Deduction">Deduction</option>
            </select>

            <select
              value={misReportType}
              onChange={(event) => setMisReportType(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="Monthly D">Monthly D</option>
              <option value="Monthly Summary">Monthly Summary</option>
            </select>

            <select
              value={misPeriod}
              onChange={(event) => setMisPeriod(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </select>

            <select
              value={misStatus}
              onChange={(event) => setMisStatus(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="Active">Active</option>
              <option value="Exit">Exit</option>
              <option value="On Hold">On Hold</option>
            </select>

            <select
              value={misFormat}
              onChange={(event) => setMisFormat(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="Excel">Excel</option>
              <option value="PDF">PDF</option>
            </select>
            <div className="flex min-w-0 justify-end">
              <GenerateButton onClick={() => {}} />
            </div>
          </form>
        </section>
      ) : activeTab === 'upload' ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
          <h2 className="mb-4 text-2xl font-semibold text-primary">Upload</h2>

          {uploadSectionMessage ? (
            <p className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {uploadSectionMessage}
            </p>
          ) : null}

          <div className="space-y-4">
            {[
              {
                label: 'Monthly Salary',
                status: uploadMonthSalaryStatus,
                setStatus: setUploadMonthSalaryStatus,
                day: uploadMonthSalaryDay,
                setDay: setUploadMonthSalaryDay,
                year: uploadMonthSalaryYear,
                setYear: setUploadMonthSalaryYear,
                month: uploadMonthSalaryMonth,
                setMonth: setUploadMonthSalaryMonth,
                fileName: uploadMonthSalaryFileName,
                setFileName: setUploadMonthSalaryFileName,
              },
              {
                label: 'Invst Declaration',
                status: uploadInvestDeclarationStatus,
                setStatus: setUploadInvestDeclarationStatus,
                day: uploadInvestDeclarationDay,
                setDay: setUploadInvestDeclarationDay,
                year: uploadInvestDeclarationYear,
                setYear: setUploadInvestDeclarationYear,
                month: uploadInvestDeclarationMonth,
                setMonth: setUploadInvestDeclarationMonth,
                fileName: uploadInvestDeclarationFileName,
                setFileName: setUploadInvestDeclarationFileName,
              },
            ].map((row) => {
              const rowEditing = uploadEditingLabel === row.label;
              const anotherRowEditing = uploadEditingLabel !== null && !rowEditing;
              const fieldLocked = !rowEditing;

              return (
                <div key={row.label} className="rounded-md">
                  <div className="mb-2 flex justify-end">
                    {rowEditing ? (
                      <button
                        type="button"
                        className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                        onClick={() => {
                          setUploadEditingLabel(null);
                          setUploadSectionMessage(`“${row.label}” row saved.`);
                        }}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={anotherRowEditing}
                        className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/50"
                        onClick={() => {
                          setUploadSectionMessage(null);
                          setUploadEditingLabel(row.label);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[160px,120px,120px,120px,140px,1fr,90px]">
                    <div
                      className={`w-full rounded-md border px-3 py-1.5 text-left text-sm font-semibold shadow-sm ${
                        fieldLocked ? 'cursor-default border-slate-200 bg-slate-100 text-slate-700' : 'border-slate-300 bg-slate-50 text-slate-800'
                      }`}
                    >
                      {row.label}
                    </div>

                    <select
                      className={`${FIELD_CLASSES} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600`}
                      value={row.status}
                      disabled={fieldLocked}
                      onChange={(event) => row.setStatus(event.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Modify">Modify</option>
                    </select>

                    <input
                      className={`${FIELD_CLASSES} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600`}
                      value={row.day}
                      disabled={fieldLocked}
                      onChange={(event) => row.setDay(event.target.value)}
                    />

                    <select
                      className={`${FIELD_CLASSES} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600`}
                      value={row.year}
                      disabled={fieldLocked}
                      onChange={(event) => row.setYear(event.target.value)}
                    >
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>

                    <select
                      className={`${FIELD_CLASSES} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600`}
                      value={row.month}
                      disabled={fieldLocked}
                      onChange={(event) => row.setMonth(event.target.value)}
                    >
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>

                    <input
                      type="file"
                      disabled={fieldLocked}
                      className="block min-w-0 w-full text-sm text-slate-700 file:mr-2 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-800 hover:file:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        row.setFileName(file ? file.name : null);
                      }}
                    />

                    <input
                      readOnly
                      value={row.fileName ?? 'N...n'}
                      className="min-w-0 w-full cursor-default rounded-md border border-slate-300 bg-slate-50 px-2 py-2 text-sm text-slate-700 shadow-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : activeTab === 'thirdParty' ? (
        <>
          {/* Header with actions for 3P-Credentials */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-primary">3P - Credentials</h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingThirdParty(true);
                  setStatusMessageThirdParty(null);
                }}
                className="rounded-md border border-primary px-4 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-60"
                disabled={isEditingThirdParty}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingThirdParty(false);
                  setStatusMessageThirdParty('3P credentials saved (front-end only).');
                }}
                disabled={!isEditingThirdParty}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
              >
                Save
              </button>
            </div>
          </div>

          {statusMessageThirdParty ? (
            <p className="text-sm text-slate-700">{statusMessageThirdParty}</p>
          ) : null}

          <section className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
            <fieldset
              disabled={!isEditingThirdParty}
              className="space-y-6 [&:disabled_input]:bg-slate-50 [&:disabled_select]:bg-slate-50 [&:disabled_input]:cursor-not-allowed [&:disabled_select]:cursor-not-allowed"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Row 1: Department , name , mobile no, Email */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Department</label>
                  <select
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.department}
                    onChange={(event) => updateThirdPartyField('department', event.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="DSA">DSA</option>
                    <option value="Verifier">Verifier</option>
                    <option value="Retail Shop">Retail Shop</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Name</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Name"
                    value={thirdPartyForm.name}
                    onChange={(event) => updateThirdPartyField('name', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Mobile No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Mobile No."
                    value={thirdPartyForm.mobileNo}
                    onChange={(event) => updateThirdPartyField('mobileNo', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Email"
                    value={thirdPartyForm.email}
                    onChange={(event) => updateThirdPartyField('email', event.target.value)}
                  />
                </div>

                {/* 2nd row :Adhar card , passport no , PAN card no , TAN no  */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Aadhaar No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Aadhaar No."
                    value={thirdPartyForm.aadharNo}
                    onChange={(event) =>
                      updateThirdPartyField(
                        'aadharNo',
                        digitsOnlyMax(event.target.value, AADHAAR_DIGITS_MAX),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Passport No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Passport No."
                    value={thirdPartyForm.passportNo}
                    onChange={(event) => updateThirdPartyField('passportNo', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">PAN Card No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="PAN Card No."
                    value={thirdPartyForm.panNo}
                    onChange={(event) =>
                      updateThirdPartyField('panNo', sanitizePan(event.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">TAN No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="TAN No."
                    value={thirdPartyForm.tanNo}
                    onChange={(event) =>
                      updateThirdPartyField('tanNo', sanitizeTan(event.target.value))
                    }
                  />
                </div>

                {/* 3 row :Gender , Address 1 , Address 2 , city  */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Gender</label>
                  <select
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.gender}
                    onChange={(event) => updateThirdPartyField('gender', event.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Address 1</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Address 1"
                    value={thirdPartyForm.address1}
                    onChange={(event) => updateThirdPartyField('address1', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Address 2</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Address 2"
                    value={thirdPartyForm.address2}
                    onChange={(event) => updateThirdPartyField('address2', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">City</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="City"
                    value={thirdPartyForm.city}
                    onChange={(event) => updateThirdPartyField('city', event.target.value)}
                  />
                </div>

                {/* 4 row :ZIP/PIN Code, Country, State */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">ZIP/PIN Code</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="ZIP/PIN Code"
                    value={thirdPartyForm.zip}
                    onChange={(event) =>
                      updateThirdPartyField('zip', digitsOnlyMax(event.target.value, ZIP_DIGITS_MAX))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Country</label>
                  <select
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.country}
                    onChange={(event) => updateThirdPartyField('country', event.target.value)}
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Thailand">Thailand</option>
                    <option value="UAE-Dubai">UAE-Dubai</option>
                    <option value="Vietnam">Vietnam</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">State</label>
                  <select
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.state}
                    disabled
                    onChange={(event) => updateThirdPartyField('state', event.target.value)}
                  >
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>

                {/* Align 3PC Empl Code under Country; Business & Branch follow (see mockup) */}
                <div className="hidden lg:block" aria-hidden="true" />
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">3PC - Empl Code</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter 3PC - Empl Code"
                    value={thirdPartyForm.threePEmplCode}
                    maxLength={10}
                    onChange={(event) => updateThirdPartyField('threePEmplCode', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Business Code</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Business Code"
                    value={thirdPartyForm.businessCode}
                    onChange={(event) => updateThirdPartyField('businessCode', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Branch Code</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Branch Code"
                    value={thirdPartyForm.branchCode}
                    onChange={(event) => updateThirdPartyField('branchCode', event.target.value)}
                  />
                </div>

                {/* 5 row :3PC - Company Name, 3PC - Entity, GST/TAX No., Bank Name */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">3PC - Company Name</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter 3PC - Company Name"
                    value={thirdPartyForm.threePCompanyName}
                    onChange={(event) => updateThirdPartyField('threePCompanyName', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">3PC - Entity</label>
                  <select
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.threePEntity}
                    onChange={(event) => updateThirdPartyField('threePEntity', event.target.value)}
                  >
                    <option value="">Select entity</option>
                    <option value="Individual">Individual</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="LLP">LLP</option>
                    <option value="LTD">LTD</option>
                    <option value="Pvt Ltd">Pvt Ltd</option>
                    <option value="Cooperative">Cooperative</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">GST/TAX No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter GST/TAX No."
                    value={thirdPartyForm.gstTaxNo}
                    onChange={(event) => updateThirdPartyField('gstTaxNo', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Bank Name</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Bank Name"
                    value={thirdPartyForm.bankName}
                    onChange={(event) => updateThirdPartyField('bankName', event.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  />
                </div>

                {/* 6 row :IFSC, Bank Account, SWIFT, IBAN */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">IFSC Code</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter IFSC Code"
                    value={thirdPartyForm.ifscCode}
                    maxLength={11}
                    onChange={(event) => updateThirdPartyField('ifscCode', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Bank Account No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Bank Account No."
                    value={thirdPartyForm.bankAccountNumber}
                    maxLength={18}
                    onChange={(event) =>
                      updateThirdPartyField('bankAccountNumber', event.target.value.replace(/[^0-9]/g, '').slice(0, 18))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">SWIFT No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="SWIFT No."
                    value={thirdPartyForm.swiftNo}
                    onChange={(event) => updateThirdPartyField('swiftNo', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">IBAN No.</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="IBAN No."
                    value={thirdPartyForm.ibanNo}
                    onChange={(event) => updateThirdPartyField('ibanNo', event.target.value)}
                  />
                </div>

                {/* 7 row :D.O.J, IRA, … */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">D.O.J</label>
                  <input
                    type="date"
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.doj}
                    onChange={(event) => updateThirdPartyField('doj', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">IRA</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="IRA"
                    value={thirdPartyForm.ira}
                    onChange={(event) => updateThirdPartyField('ira', event.target.value)}
                  />
                </div>

                {/* 8 row : Remarks */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Remarks</label>
                  <select
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.remarks}
                    onChange={(event) => updateThirdPartyField('remarks', event.target.value)}
                  >
                    <option value="">Select Remarks</option>
                    <option value="FNF">FNF</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Issue Pending">Issue Pending</option>
                  </select>
                </div>

                {/* 9 row : Status,Exit Date,Business Deposit,Sharing Ratio (3P : Blaunk) */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.status}
                    onChange={(event) => updateThirdPartyField('status', event.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Exit">Exit</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Exit Date</label>
                  <input
                    type="date"
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.exitDate}
                    disabled
                    onChange={(event) => updateThirdPartyField('exitDate', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Business Deposit</label>
                  <input
                    className={FIELD_CLASSES}
                    placeholder="Enter Business Deposit"
                    value={thirdPartyForm.businessDeposit}
                    onChange={(event) => updateThirdPartyField('businessDeposit', event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Sharing Ratio (3P : Blaunk)
                  </label>
                  <div className="grid grid-cols-[minmax(0,1fr),24px,minmax(0,1fr)] items-center gap-2">
                    <input
                      className={FIELD_CLASSES}
                      value={thirdPartyForm.sharingThreeP}
                      onChange={(event) => updateThirdPartyField('sharingThreeP', event.target.value)}
                    />
                    <span className="text-center text-sm font-semibold text-slate-700">:</span>
                    <input
                      className={FIELD_CLASSES}
                      value={thirdPartyForm.sharingBlaunk}
                      onChange={(event) => updateThirdPartyField('sharingBlaunk', event.target.value)}
                    />
                  </div>
                </div>

                {/* 10 row : Verified Status & Document */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Verified Status &amp; Document
                  </label>
                  <select
                    className={FIELD_CLASSES}
                    value={thirdPartyForm.verifiedStatus}
                    onChange={(event) => updateThirdPartyField('verifiedStatus', event.target.value)}
                  >
                    <option value="">Select Verified Status</option>
                    <option value="Verified">Verified</option>
                    <option value="Not Verified">Not Verified</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Reference section (for 3P) */}
            <div className="mt-8 space-y-3">
              <h2 className="text-lg font-semibold text-primary">Reference</h2>

              {[0, 1].map((index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 md:grid-cols-4"
                >
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Name</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="Name"
                      value={thirdPartyReferences[index]?.name ?? ''}
                      onChange={(event) =>
                        updateThirdPartyReferenceField(index, 'name', event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Mobile No.
                    </label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="Mobile"
                      value={thirdPartyReferences[index]?.mobile ?? ''}
                      onChange={(event) =>
                        updateThirdPartyReferenceField(
                          index,
                          'mobile',
                          digitsOnlyMax(event.target.value, MOBILE_DIGITS_MAX),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Designation
                    </label>
                    <select
                      className={FIELD_CLASSES}
                      value={thirdPartyReferences[index]?.designation ?? ''}
                      onChange={(event) =>
                        updateThirdPartyReferenceField(index, 'designation', event.target.value)
                      }
                    >
                      <option value="">Select Designation</option>
                      <option value="Manager">Manager</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">City</label>
                    <input
                      className={FIELD_CLASSES}
                      placeholder="City"
                      value={thirdPartyReferences[index]?.city ?? ''}
                      onChange={(event) =>
                        updateThirdPartyReferenceField(index, 'city', event.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Documents section for 3P */}
            <div className="mt-10 space-y-4">
              <h2 className="text-lg font-semibold text-primary">Documents</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  {
                    label: 'Employee Photo',
                    preview: thirdPartyEmployeePhoto,
                    setPreview: setThirdPartyEmployeePhoto,
                  },
                  {
                    label: 'CHQ Image',
                    preview: thirdPartyChqImage,
                    setPreview: setThirdPartyChqImage,
                  },
                  {
                    label: 'PAN Card',
                    preview: thirdPartyPanImage,
                    setPreview: setThirdPartyPanImage,
                  },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="space-y-2"
                  >
                    <p className="text-xs font-semibold text-slate-700">{doc.label}</p>
                    <label className="flex h-40 w-32 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-red-400 bg-yellow-50 text-[10px] text-red-600 shadow-sm">
                      <span className="mb-1 w-full text-center text-xs font-semibold text-slate-700">
                        Image
                      </span>
                      {doc.preview ? (
                        // eslint-disable-next-line jsx-a11y/img-redundant-alt
                        <img
                          src={doc.preview}
                          alt={`${doc.label} preview`}
                          className="mt-1 h-24 w-24 rounded object-cover border border-slate-300"
                        />
                      ) : null}
                      <span className="mt-2 text-center text-[10px] text-red-600">
                        Click to upload (max: 200KB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          if (file.size > 200 * 1024) {
                            alert('Please select an image smaller than 200KB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            doc.setPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600">
          This tab ({activeTab}) is ready for future implementation.
        </section>
      )}
    </div>
  );
};

