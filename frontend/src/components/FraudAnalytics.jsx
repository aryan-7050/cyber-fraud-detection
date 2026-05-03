import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Security,
  Warning,
  Speed,
  Assessment,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { transactionService } from '../services/api';

const FraudAnalytics = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('week');
  const [fraudData, setFraudData] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await transactionService.getUserTransactions({ limit: 100 });
      const transactions = response.transactions || [];
      
      const fraudTrend = processFraudTrend(transactions);
      const riskDistribution = processRiskDistribution(transactions);
      
      setFraudData(fraudTrend);
      setRiskMetrics(riskDistribution);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const processFraudTrend = (transactions) => {
    const grouped = {};
    transactions.forEach(t => {
      const date = new Date(t.timestamp).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = { date, total: 0, fraud: 0 };
      }
      grouped[date].total++;
      if (t.isFraudulent) grouped[date].fraud++;
    });
    return Object.values(grouped).slice(-7);
  };

  const processRiskDistribution = (transactions) => {
    const riskLevels = { low: 0, medium: 0, high: 0, critical: 0 };
    transactions.forEach(t => {
      if (t.riskLevel) riskLevels[t.riskLevel]++;
    });
    return Object.entries(riskLevels).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#48bb78', '#ed8936', '#f56565', '#9b2c2c'];

  const metrics = [
    {
      title: 'Fraud Detection Rate',
      value: '94.5%',
      change: '+2.3%',
      trend: 'up',
      icon: <Security />,
      color: '#48bb78',
    },
    {
      title: 'False Positive Rate',
      value: '2.1%',
      change: '-0.5%',
      trend: 'down',
      icon: <Warning />,
      color: '#ed8936',
    },
    {
      title: 'Avg Risk Score',
      value: '23.4',
      change: '-3.2',
      trend: 'down',
      icon: <Speed />,
      color: '#667eea',
    },
    {
      title: 'Alerts Resolved',
      value: '156',
      change: '+12',
      trend: 'up',
      icon: <Assessment />,
      color: '#f56565',
    },
  ];

  // Custom tooltip formatter for currency
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          {payload.map((p, idx) => (
            <Typography key={idx} variant="caption" color={p.color}>
              {p.name}: ₹{p.value.toLocaleString('en-IN')}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Fraud Analytics Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(metric.color, 0.2), color: metric.color }}>
                      {metric.icon}
                    </Avatar>
                    <Chip
                      label={metric.change}
                      size="small"
                      icon={metric.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                      sx={{
                        bgcolor: alpha(metric.trend === 'up' ? '#48bb78' : '#f56565', 0.2),
                        color: metric.trend === 'up' ? '#48bb78' : '#f56565',
                      }}
                    />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.title}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Fraud Detection Trend</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} label="Time Range">
                    <MenuItem value="day">Last 24 Hours</MenuItem>
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">Last Month</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fraudData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                    <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
                    <YAxis 
                      stroke={theme.palette.text.secondary}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stackId="1"
                      stroke="#667eea"
                      fill="#667eea"
                      fillOpacity={0.3}
                      name="Total Transactions"
                    />
                    <Area
                      type="monotone"
                      dataKey="fraud"
                      stackId="2"
                      stroke="#f56565"
                      fill="#f56565"
                      fillOpacity={0.3}
                      name="Fraudulent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Risk Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskMetrics}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {riskMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                ML Model Performance
              </Typography>
              <Box sx={{ space: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Accuracy</Typography>
                  <LinearProgress variant="determinate" value={94} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
                  <Typography variant="caption" color="text.secondary">94%</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Precision</Typography>
                  <LinearProgress variant="determinate" value={89} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
                  <Typography variant="caption" color="text.secondary">89%</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Recall</Typography>
                  <LinearProgress variant="determinate" value={92} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
                  <Typography variant="caption" color="text.secondary">92%</Typography>
                </Box>
                <Box>
                  <Typography variant="body2">F1 Score</Typography>
                  <LinearProgress variant="determinate" value={90.5} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
                  <Typography variant="caption" color="text.secondary">90.5%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FraudAnalytics;