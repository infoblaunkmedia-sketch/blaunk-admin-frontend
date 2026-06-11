import type { TableColumn } from 'react-data-table-component';

export type ShareholdingMisRow = {
  srNo: number | string;
  pan: string;
  updatedAt: string;
  hrEmployeeName: string;
  hrEmpCode: string;
  hrDepartment: string;
  hrDesignation: string;
  hrStatus: string;
  nameShareholding: string;
  mobile: string;
  email: string;
  aadhaar: string;
  address1: string;
  address2: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  gender: string;
  formSubmission: string;
  holdingPercent: string | number;
  shareType: string;
  faceValue: string | number;
  numberOfShares: string | number;
  mode: string;
  isinCode: string;
  dp: string;
  dpNumber: string;
  beneficiaryDpId: string;
  folioNumber: string;
  certificateNo: string;
  distinctiveFrom: string;
  distinctiveTo: string;
  yearOfIssuance: string;
  stakeholder: string;
  dateOfAllotment: string;
  remarks: string;
  pledge: string;
  status: string;
  exitDate: string;
  year: string;
  bankName: string;
  ifscCode: string;
  bankAccountNo: string;
  bankCity: string;
  bankCountry: string;
  pledgeStatus: string;
  status2: string;
  nominee1Name: string;
  nominee1Mobile: string;
  nominee1Relation: string;
  nominee1Percent: string | number;
  nominee1Pan: string;
  nominee2Name: string;
  nominee2Mobile: string;
  nominee2Relation: string;
  nominee2Percent: string | number;
  nominee2Pan: string;
  nominee3Name: string;
  nominee3Mobile: string;
  nominee3Relation: string;
  nominee3Percent: string | number;
  nominee3Pan: string;
  lastReeditDate: string;
  dataEntryBy: string;
};

export const SHAREHOLDING_MIS_COLUMNS: Array<{ key: keyof ShareholdingMisRow; label: string; width?: string }> = [
  { key: 'srNo', label: 'Sr No', width: '72px' },
  { key: 'pan', label: 'PAN', width: '120px' },
  { key: 'updatedAt', label: 'Updated At', width: '120px' },
  { key: 'hrEmployeeName', label: 'HR Employee Name', width: '160px' },
  { key: 'hrEmpCode', label: 'HR Emp Code', width: '110px' },
  { key: 'hrDepartment', label: 'HR Department', width: '130px' },
  { key: 'hrDesignation', label: 'HR Designation', width: '130px' },
  { key: 'hrStatus', label: 'HR Status', width: '100px' },
  { key: 'nameShareholding', label: 'Name (Shareholding)', width: '160px' },
  { key: 'mobile', label: 'Mobile', width: '110px' },
  { key: 'email', label: 'Email', width: '180px' },
  { key: 'aadhaar', label: 'Aadhaar', width: '130px' },
  { key: 'address1', label: 'Address 1', width: '180px' },
  { key: 'address2', label: 'Address 2', width: '160px' },
  { key: 'landmark', label: 'Landmark', width: '140px' },
  { key: 'area', label: 'Area', width: '120px' },
  { key: 'city', label: 'City', width: '120px' },
  { key: 'state', label: 'State', width: '110px' },
  { key: 'pinCode', label: 'Pin Code', width: '100px' },
  { key: 'country', label: 'Country', width: '110px' },
  { key: 'gender', label: 'Gender', width: '90px' },
  { key: 'formSubmission', label: 'Form Submission', width: '130px' },
  { key: 'holdingPercent', label: 'Holding %', width: '100px' },
  { key: 'shareType', label: 'Share Type', width: '110px' },
  { key: 'faceValue', label: 'Face Value', width: '100px' },
  { key: 'numberOfShares', label: 'No. of Shares', width: '120px' },
  { key: 'mode', label: 'Mode', width: '90px' },
  { key: 'isinCode', label: 'ISIN Code', width: '130px' },
  { key: 'dp', label: 'DP', width: '90px' },
  { key: 'dpNumber', label: 'DP Number', width: '120px' },
  { key: 'beneficiaryDpId', label: 'Beneficiary DP ID', width: '150px' },
  { key: 'folioNumber', label: 'Folio Number', width: '120px' },
  { key: 'certificateNo', label: 'Certificate No', width: '130px' },
  { key: 'distinctiveFrom', label: 'Distinctive From', width: '130px' },
  { key: 'distinctiveTo', label: 'Distinctive To', width: '130px' },
  { key: 'yearOfIssuance', label: 'Year of Issuance', width: '130px' },
  { key: 'stakeholder', label: 'Stakeholder', width: '120px' },
  { key: 'dateOfAllotment', label: 'Date of Allotment', width: '140px' },
  { key: 'remarks', label: 'Remarks', width: '120px' },
  { key: 'pledge', label: 'Pledge', width: '100px' },
  { key: 'status', label: 'Status', width: '100px' },
  { key: 'exitDate', label: 'Exit Date', width: '120px' },
  { key: 'year', label: 'Year', width: '100px' },
  { key: 'bankName', label: 'Bank Name', width: '140px' },
  { key: 'ifscCode', label: 'IFSC Code', width: '120px' },
  { key: 'bankAccountNo', label: 'Bank Account No.', width: '150px' },
  { key: 'bankCity', label: 'Bank City', width: '120px' },
  { key: 'bankCountry', label: 'Bank Country', width: '120px' },
  { key: 'pledgeStatus', label: 'Pledge Status', width: '120px' },
  { key: 'status2', label: 'Status', width: '100px' },
  { key: 'nominee1Name', label: 'Nominee 1 Name', width: '140px' },
  { key: 'nominee1Mobile', label: 'Nominee 1 Mobile', width: '130px' },
  { key: 'nominee1Relation', label: 'Nominee 1 Relation', width: '140px' },
  { key: 'nominee1Percent', label: 'Nominee 1 %', width: '110px' },
  { key: 'nominee1Pan', label: 'Nominee 1 PAN', width: '120px' },
  { key: 'nominee2Name', label: 'Nominee 2 Name', width: '140px' },
  { key: 'nominee2Mobile', label: 'Nominee 2 Mobile', width: '130px' },
  { key: 'nominee2Relation', label: 'Nominee 2 Relation', width: '140px' },
  { key: 'nominee2Percent', label: 'Nominee 2 %', width: '110px' },
  { key: 'nominee2Pan', label: 'Nominee 2 PAN', width: '120px' },
  { key: 'nominee3Name', label: 'Nominee 3 Name', width: '140px' },
  { key: 'nominee3Mobile', label: 'Nominee 3 Mobile', width: '130px' },
  { key: 'nominee3Relation', label: 'Nominee 3 Relation', width: '140px' },
  { key: 'nominee3Percent', label: 'Nominee 3 %', width: '110px' },
  { key: 'nominee3Pan', label: 'Nominee 3 PAN', width: '120px' },
  { key: 'lastReeditDate', label: 'Last Re-edit Date', width: '140px' },
  { key: 'dataEntryBy', label: 'Data Entry By', width: '130px' },
];

export function buildShareholdingMisTableColumns(): TableColumn<ShareholdingMisRow>[] {
  return SHAREHOLDING_MIS_COLUMNS.map((col, index) => ({
    id: `${String(col.key)}-${index}`,
    name: col.label,
    selector: (row) => String(row[col.key] ?? ''),
    width: col.width,
    minWidth: col.width,
    wrap: false,
  }));
}
