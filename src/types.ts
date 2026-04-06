export interface VendorInfo {
  id: string;
  name: string;
  sourceSystem?: string;
  sourceSystemId?: string;
  nameLower?: string;
  paymentMethod?: string | null;
  accountType?: string | null;
  track1099?: boolean;
  lastSyncedAt?: string;
  owner?: string;
  ownerId?: string;
  secondaryOwner?: string;
  secondaryOwnerId?: string;
  department?: string;
  departmentId?: string;
  purpose?: string;
  spendType?: string;

  contractStartDate?: string;
  contractEndDate?: string;
  contractLengthMonths?: number;
  autoRenew?: boolean | string;
  renewalRate?: string | number;
  renewalNoticeDays?: number;
  billingFrequency?: string;
  terminationTerms?: string;
  created_at?: string;
  modified_at?: string;
}

export interface SpendRow {
  vendor: string;
  vendorId: string;
  month: string;
  amount: number;
}

export interface SpendResponse {
  vendors: string[];
  from: string;
  to: string;
  data: SpendRow[];
}

export interface SpendErrorResponse {
  error: string;
  details: string;
}
