'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/src/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  Shield,
  Eye,
  AlertTriangle,
  Database,
  RefreshCw,
  Pickaxe,
  Gift,
  Trophy,
  Users,
  ArrowRightLeft
} from 'lucide-react';
import { adminApi, WalletStats, AdminWallet, AdminTransaction } from '@/src/lib/admin-api';

export default function AdminWallets() {
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalWallets: 0,
    totalBalance: 0,
    totalSent: 0,
    totalReceived: 0
  });
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<AdminTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletStats = async () => {
    try {
      const response = await adminApi.getWalletStats();
      if (response.success && response.data) {
        setWalletStats(response.data);
      } else {
        setWalletStats({
          totalWallets: 0,
          totalBalance: 0,
          totalSent: 0,
          totalReceived: 0
        });
      }
    } catch (err) {
      console.error('Error fetching wallet stats:', err);
      setError('Failed to fetch wallet statistics');
      setWalletStats({
        totalWallets: 0,
        totalBalance: 0,
        totalSent: 0,
        totalReceived: 0
      });
    }
  };

  const fetchWallets = async (page = 1, search = '') => {
    try {
      const response = await adminApi.getAllWallets({
        page,
        limit: 10,
        search
      });
      if (response.success && response.data && response.data.data) {
        setWallets(response.data.data);
      } else {
        setWallets([]);
      }
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Failed to fetch wallets');
      setWallets([]);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await adminApi.getRecentTransactions(10);
      if (response.success && response.data && Array.isArray(response.data)) {
        setRecentTransactions(response.data);
      } else {
        setRecentTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
      setError('Failed to fetch recent transactions');
      setRecentTransactions([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchWalletStats(),
      fetchWallets(currentPage, searchTerm),
      fetchRecentTransactions()
    ]);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchWallets(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchWallets(1, searchTerm);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to get transaction type info
  const getTransactionTypeInfo = (transaction: AdminTransaction) => {
    switch (transaction.type) {
      case 'mining':
        return {
          icon: <Pickaxe className="h-4 w-4 text-orange-600" />,
          bgColor: 'bg-orange-100',
          label: 'Mining Reward',
          description: transaction.description || 'Mining reward'
        };
      case 'task_reward':
        return {
          icon: <Trophy className="h-4 w-4 text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          label: 'Task Reward',
          description: transaction.description || 'Task completion reward'
        };
      case 'bonus':
        return {
          icon: <Gift className="h-4 w-4 text-purple-600" />,
          bgColor: 'bg-purple-100',
          label: 'Bonus',
          description: transaction.description || 'Bonus reward'
        };
      case 'referral':
        return {
          icon: <Users className="h-4 w-4 text-blue-600" />,
          bgColor: 'bg-blue-100',
          label: 'Referral Reward',
          description: transaction.description || 'Referral reward'
        };
      case 'send':
        return {
          icon: <TrendingUp className="h-4 w-4 text-red-600" />,
          bgColor: 'bg-red-100',
          label: 'Sent',
          description: transaction.description || 'Token transfer'
        };
      case 'receive':
        return {
          icon: <TrendingDown className="h-4 w-4 text-green-600" />,
          bgColor: 'bg-green-100',
          label: 'Received',
          description: transaction.description || 'Token received'
        };
      default:
        return {
          icon: <ArrowRightLeft className="h-4 w-4 text-gray-600" />,
          bgColor: 'bg-gray-100',
          label: 'Transaction',
          description: transaction.description || 'Transaction'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && (!wallets || wallets.length === 0)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading wallet data...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage user wallets and transactions</p>
          </div>
          <Button onClick={loadData} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Wallet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletStats.totalWallets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active user wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletStats.totalBalance)} CELF</div>
            <p className="text-xs text-muted-foreground">Combined wallet balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletStats.totalSent)} CELF</div>
            <p className="text-xs text-muted-foreground">Total outgoing transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletStats.totalReceived)} CELF</div>
            <p className="text-xs text-muted-foreground">Total incoming transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* User Wallets */}
      <Card>
        <CardHeader>
          <CardTitle>User Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          {wallets && wallets.length > 0 ? (
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Wallet className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{wallet.user.firstName} {wallet.user.lastName}</p>
                      <p className="text-sm text-gray-500">{wallet.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(wallet.totalBalance)} CELF</p>
                    <p className="text-sm text-gray-500">{wallet.addressCount} addresses</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No wallets found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const typeInfo = getTransactionTypeInfo(transaction);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${typeInfo.bgColor}`}>
                        {typeInfo.icon}
                      </div>
                      <div>
                        <p className="font-medium">
                          {typeInfo.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.fromUser ? `${transaction.fromUser.firstName} ${transaction.fromUser.lastName}` : 'System'} → {transaction.toUser ? `${transaction.toUser.firstName} ${transaction.toUser.lastName}` : 'System'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(transaction.amount)} CELF</p>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Wallet Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Wallet Monitoring</h4>
                  <p className="text-sm text-gray-600">Real-time monitoring of all wallet activities</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Transaction Limits</h4>
                  <p className="text-sm text-gray-600">Configurable daily and monthly transaction limits</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <h4 className="font-medium">Fraud Detection</h4>
                  <p className="text-sm text-gray-600">AI-powered fraud detection and prevention</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-purple-500" />
                <div>
                  <h4 className="font-medium">Wallet Backup</h4>
                  <p className="text-sm text-gray-600">Automated backup and recovery systems</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
}
