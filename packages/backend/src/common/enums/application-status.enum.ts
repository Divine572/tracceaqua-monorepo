
export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Pending Review',
  [ApplicationStatus.APPROVED]: 'Approved',
  [ApplicationStatus.REJECTED]: 'Rejected',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ApplicationStatus.APPROVED]: 'bg-green-100 text-green-800 border-green-200',
  [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
};