/**
 * Transaction Details Types
 */

export interface TransactionDetail {
  id: string;
  type: 'send' | 'receive' | 'mining' | 'referral' | 'task_reward' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description?: string;
  createdAt?: string;
  fee?: number;
  toAddress?: string;
  fromAddress?: string;
  confirmations?: number;
  blockHash?: string;
  recipientName?: string;
  senderName?: string;
  taskId?: string;
  fromUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  toUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
