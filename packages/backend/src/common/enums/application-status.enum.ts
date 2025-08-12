
export enum ApplicationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESUBMITTED = 'RESUBMITTED',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Pending Review',
  [ApplicationStatus.UNDER_REVIEW]: 'Under Review',
  [ApplicationStatus.APPROVED]: 'Approved',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.RESUBMITTED]: 'Resubmitted',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ApplicationStatus.UNDER_REVIEW]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ApplicationStatus.APPROVED]: 'bg-green-100 text-green-800 border-green-200',
  [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
  [ApplicationStatus.RESUBMITTED]: 'bg-purple-100 text-purple-800 border-purple-200',
};