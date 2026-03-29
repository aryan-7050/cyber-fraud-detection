import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Pagination,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Visibility,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { transactionService } from '../services/api';

const TransactionHistory = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    riskLevel: 'all',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getUserTransactions({ page, limit: 10 });
      setTransactions(response.transactions || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(t => t.riskLevel === filters.riskLevel);
    }
    if (filters.search) {
      filtered = filtered.filter(t => 
        t.amount.toString().includes(filters.search) ||
        t.recipient?.name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return '#48bb78';
      case 'medium': return '#ed8936';
      case 'high': return '#f56565';
      case 'critical': return '#9b2c2c';
      default: return '#718096';
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Transaction History
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              select
              size="small"
              label="Type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="transfer">Transfer</MenuItem>
              <MenuItem value="debit">Debit</MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="flagged">Flagged</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Risk Level"
              value={filters.riskLevel}
              onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        ${transaction.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {transaction.recipient?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.riskLevel.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: alpha(getRiskColor(transaction.riskLevel), 0.2),
                          color: getRiskColor(transaction.riskLevel),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        size="small"
                        sx={{
                          bgcolor: transaction.status === 'completed' 
                            ? alpha('#48bb78', 0.2)
                            : transaction.status === 'flagged'
                            ? alpha('#f56565', 0.2)
                            : alpha('#ed8936', 0.2),
                          color: transaction.status === 'completed' 
                            ? '#48bb78'
                            : transaction.status === 'flagged'
                            ? '#f56565'
                            : '#ed8936',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      {transaction.isFraudulent && (
                        <Warning sx={{ fontSize: 16, color: '#f56565', ml: 1 }} />
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredTransactions.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No transactions found</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionHistory;