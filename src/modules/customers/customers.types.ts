export type CustomerStatus = 'Active' | 'Suspended' | 'Blocked';
export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved';
export type ReviewStatus = 'Published' | 'Hidden' | 'Flagged';

export interface Individual {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  registrationDate: string;
  accountStatus: CustomerStatus;
  lastLoginDate: string;
  totalOrders: number;
  internalNotes: string;
}

export interface CustomerIssue {
  id: string;
  rnNumber: string;
  customerName: string;
  customerId: string;
  article: string;
  issueType: string;
  vendorName: string;
  vendorResponse: string;
  penaltyAmount: number;
  status: IssueStatus;
  country: string;
  raisedDate: string;
  resolvedDate: string;
}

export interface CustomerReview {
  id: string;
  reviewerName: string;
  product: string;
  rating: number;
  reviewText: string;
  date: string;
  status: ReviewStatus;
}
