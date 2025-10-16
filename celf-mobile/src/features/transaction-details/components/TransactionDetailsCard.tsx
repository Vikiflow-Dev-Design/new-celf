/**
 * Transaction Details Card Component
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/design-tokens';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import type { TransactionDetail } from '../types';

interface TransactionDetailsCardProps {
  transaction: TransactionDetail;
}

export const TransactionDetailsCard: React.FC<TransactionDetailsCardProps> = ({ transaction }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTransactionTypeLabel = (type: string, taskId?: string): string => {
    if (!type) return 'Unknown';
    
    // Check if it's a bonus transaction with taskId (task reward)
    if (type === 'bonus' && taskId) {
      return 'Task Reward';
    }
    
    switch (type) {
      case 'send': return 'Send';
      case 'receive': return 'Receive';
      case 'mining': return 'Mining Reward';
      case 'task_reward': return 'Task Reward';
      case 'referral': return 'Referral Bonus';
      case 'bonus': return 'Bonus';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getStatusColor = (status: string): string => {
    if (!status) return Colors.text.primary;
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'confirmed':
        return Colors.status.success;
      case 'pending':
        return Colors.status.warning;
      case 'failed':
        return Colors.status.error;
      default:
        return Colors.text.primary;
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    // You could add a toast notification here
  };

  return (
    <Card variant="default" style={{ marginBottom: Spacing.xl }}>
      <Typography variant="h3" weight="semibold" style={{ marginBottom: Spacing.lg }}>
        Transaction Details
      </Typography>

      <DetailRow 
        label="Transaction ID" 
        value={transaction.id} 
        copyable
        onCopy={() => copyToClipboard(transaction.id)}
      />
      <DetailRow 
        label="Type" 
        value={getTransactionTypeLabel(transaction.type, transaction.taskId)} 
      />
      <DetailRow 
        label="Amount" 
        value={`${transaction.amount} CELF`} 
        valueColor={transaction.type === 'receive' || transaction.type === 'mining' || 
                   transaction.type === 'task_reward' || transaction.type === 'referral' || 
                   transaction.type === 'bonus' ? 
                   Colors.status.success : Colors.text.primary}
      />
      <DetailRow 
        label="Status" 
        value={transaction.status} 
        capitalize 
        valueColor={getStatusColor(transaction.status)}
      />
      <DetailRow label="Date & Time" value={formatDate(transaction.createdAt || transaction.timestamp)} />
      
      {transaction.description && (
        <DetailRow label="Description" value={transaction.description} />
      )}
      
      {transaction.taskId && (
        <DetailRow label="Task ID" value={transaction.taskId} />
      )}
      
      {transaction.fee !== undefined && (
        <DetailRow 
          label="Network Fee" 
          value={transaction.fee > 0 ? `${transaction.fee} CELF` : 'No fee'} 
        />
      )}
      
      {transaction.fromUser && (
        <DetailRow 
          label="From" 
          value={`${transaction.fromUser.firstName} ${transaction.fromUser.lastName}`} 
        />
      )}
      
      {transaction.toUser && (
        <DetailRow 
          label="To" 
          value={`${transaction.toUser.firstName} ${transaction.toUser.lastName}`} 
        />
      )}
      
      {transaction.senderName && !transaction.fromUser && (
        <DetailRow label="From" value={transaction.senderName} />
      )}
      
      {transaction.recipientName && !transaction.toUser && (
        <DetailRow label="To" value={transaction.recipientName} />
      )}
      
      {transaction.fromAddress && (
        <DetailRow 
          label="From Address" 
          value={transaction.fromAddress} 
          copyable
          onCopy={() => copyToClipboard(transaction.fromAddress)}
        />
      )}
      
      {transaction.toAddress && (
        <DetailRow 
          label="To Address" 
          value={transaction.toAddress} 
          copyable
          onCopy={() => copyToClipboard(transaction.toAddress)}
        />
      )}
      
      {transaction.confirmations !== undefined && (
        <DetailRow 
          label="Confirmations" 
          value={`${transaction.confirmations || 0}/6`}
          valueColor={transaction.confirmations > 0 ? Colors.status.success : Colors.status.warning}
        />
      )}
      
      {transaction.blockHash && (
        <DetailRow 
          label="Block Hash" 
          value={transaction.blockHash} 
          copyable
          onCopy={() => copyToClipboard(transaction.blockHash)}
        />
      )}
    </Card>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  capitalize?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  valueColor?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ 
  label, 
  value, 
  capitalize, 
  copyable, 
  onCopy,
  valueColor 
}) => {
  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border.light
    }}>
      <Typography variant="bodyMedium" color="secondary" style={{ flex: 1 }}>
        {label}
      </Typography>
      <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Typography 
          variant="bodyMedium" 
          weight="semibold" 
          style={{ 
            textAlign: 'right',
            textTransform: capitalize ? 'capitalize' : 'none',
            color: valueColor || Colors.text.primary,
            marginRight: copyable ? Spacing.xs : 0
          }}
        >
          {value}
        </Typography>
        {copyable && (
          <TouchableOpacity onPress={onCopy} style={{ padding: Spacing.xs }}>
            <Ionicons name="copy-outline" size={16} color={Colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};