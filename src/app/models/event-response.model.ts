export interface ApproveEventResponse {
  result: 'approved' | 'conflict' | string;
  message: string;
  conflicts?: any[];
}
