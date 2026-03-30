import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  Slide,
  Fab,
  Zoom,
  AppBar,
  Toolbar,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Security,
  AccountBalance,
  AttachMoney,
  Settings,
  Logout,
  Add,
  Notifications,
  DarkMode,
  LightMode,
  Dashboard as DashboardIcon,
  History,
  Analytics,
  Speed,
  VerifiedUser,
  Shield,
  Timeline,
  Refresh,
  Menu as MenuIcon,
  Close,
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { transactionService, authService } from '../services/api';
import { toast } from 'react-toastify';
import { ThemeContext } from '../App';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState('info');
  const [lastAlertTime, setLastAlertTime] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshInterval = useRef(null);
  const sidebarTimeout = useRef(null);

  const sidebarWidth = sidebarHovered ? 240 : 70;

  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchDashboardData();
    setupRealTimeAlerts();
    setupAutoRefresh();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (sidebarTimeout.current) {
        clearTimeout(sidebarTimeout.current);
      }
    };
  }, []);

  const handleSidebarMouseEnter = () => {
    if (sidebarTimeout.current) {
      clearTimeout(sidebarTimeout.current);
    }
    setSidebarHovered(true);
  };

  const handleSidebarMouseLeave = () => {
    sidebarTimeout.current = setTimeout(() => {
      setSidebarHovered(false);
    }, 300);
  };

  const setupAutoRefresh = () => {
    refreshInterval.current = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);
  };

  const setupRealTimeAlerts = () => {
    const interval = setInterval(() => {
      const now = new Date();
      if (!lastAlertTime || (now - lastAlertTime) > 30000) {
        if (Math.random() > 0.85) {
          setLastAlertTime(now);
          showCenteredNotification('⚠️ New fraud alert detected!', 'warning');
          fetchDashboardData(true);
        }
      }
    }, 45000);
    return () => clearInterval(interval);
  };

  const showCenteredNotification = (message, severity = 'info') => {
    setNotificationMessage(message);
    setNotificationSeverity(severity);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [transactionsRes, alertsRes, statsRes] = await Promise.all([
        transactionService.getUserTransactions({ limit: 20 }),
        transactionService.getFraudAlerts(),
        transactionService.getTransactionStats(),
      ]);

      setTransactions(transactionsRes.transactions || []);
      setAlerts(alertsRes.alerts || []);
      setStats(statsRes.stats);
      
      if (!silent) {
        showCenteredNotification('Dashboard refreshed!', 'success');
      }
    } catch (error) {
      if (!silent) {
        showCenteredNotification('Failed to fetch data', 'error');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchDashboardData();
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    showCenteredNotification('Logged out successfully', 'success');
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    showCenteredNotification('All alerts cleared', 'success');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'New Transaction', icon: <Add />, path: '/transaction' },
    { text: 'Transaction History', icon: <History />, path: '/history' },
    { text: 'Fraud Analytics', icon: <Analytics />, path: '/analytics' },
    { text: 'AI Detection', icon: <Speed />, path: '/ai-detection' },
    { text: 'Security Settings', icon: <Settings />, path: '/security' },
  ];

  const statsCards = [
    {
      title: 'Total Transactions',
      value: stats?.totalTransactions || 0,
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      color: '#667eea',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Amount',
      value: `$${stats?.totalAmount?.toFixed(2) || 0}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#48bb78',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Fraud Alerts',
      value: alerts.length,
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: '#f56565',
      trend: '-5%',
      trendUp: false,
    },
    {
      title: 'Fraud Score',
      value: user?.fraudScore || 0,
      icon: <Security sx={{ fontSize: 40 }} />,
      color: '#ed8936',
      trend: user?.fraudScore > 50 ? 'Critical' : 'Normal',
      trendUp: user?.fraudScore > 50,
    },
  ];

  const transactionChartData = {
    labels: transactions.slice(0, 10).map(t => new Date(t.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Transaction Amount',
        data: transactions.slice(0, 10).map(t => t.amount),
        borderColor: '#667eea',
        backgroundColor: alpha('#667eea', 0.1),
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const riskData = {
    labels: stats?.riskDistribution?.map(r => r._id) || ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: stats?.riskDistribution?.map(r => r.count) || [0, 0, 0, 0],
        backgroundColor: ['#48bb78', '#ed8936', '#f56565', '#9b2c2c'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: theme.palette.text.primary },
      },
    },
    scales: {
      y: {
        grid: { color: alpha(theme.palette.text.primary, 0.1) },
        ticks: { color: theme.palette.text.secondary },
      },
      x: {
        grid: { display: false },
        ticks: { color: theme.palette.text.secondary },
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LinearProgress sx={{ width: 300 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hover Sidebar - Desktop */}
      <Box
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        sx={{
          width: sidebarWidth,
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bgcolor: 'background.paper',
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          zIndex: 1200,
          display: { xs: 'none', md: 'block' },
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', py: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Shield sx={{ fontSize: sidebarHovered ? 40 : 32, color: theme.palette.primary.main }} />
          {sidebarHovered && (
            <>
              <Typography variant="h6" fontWeight={700}>FraudShield</Typography>
              <Typography variant="caption" color="text.secondary">AI-Powered</Typography>
            </>
          )}
        </Box>

        {/* Menu Items */}
        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => (
            <Tooltip key={item.text} title={!sidebarHovered ? item.text : ""} placement="right">
              <ListItem
                button
                onClick={() => handleItemClick(item.path)}
                sx={{
                  justifyContent: sidebarHovered ? 'flex-start' : 'center',
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: location.pathname === item.path ? alpha('#667eea', 0.1) : 'transparent',
                  '&:hover': { bgcolor: alpha('#667eea', 0.05) },
                }}
              >
                <ListItemIcon sx={{ minWidth: sidebarHovered ? 40 : 'auto', justifyContent: 'center', color: location.pathname === item.path ? '#667eea' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarHovered && <ListItemText primary={item.text} />}
              </ListItem>
            </Tooltip>
          ))}
        </List>

        {/* User Section */}
        <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Tooltip title={!sidebarHovered ? user?.name : ""} placement="right">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: sidebarHovered ? 'flex-start' : 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              {sidebarHovered && (
                <Box sx={{ ml: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
              )}
            </Box>
          </Tooltip>
          {sidebarHovered && (
            <Button fullWidth variant="outlined" startIcon={<Logout />} onClick={handleLogout} size="small">
              Logout
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, ml: { xs: 0, md: `${sidebarWidth}px` }, transition: 'margin-left 0.3s ease' }}>
        
        {/* Top Bar */}
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton onClick={handleDrawerToggle} sx={{ display: { md: 'none' }, mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>Dashboard</Typography>
            <IconButton onClick={handleManualRefresh}><Refresh /></IconButton>
            <IconButton onClick={() => setDarkMode(!darkMode)}>{darkMode ? <LightMode /> : <DarkMode />}</IconButton>
            <IconButton onClick={handleNotificationClick}>
              <Badge badgeContent={alerts.length} color="error"><Notifications /></Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Notification Menu */}
        <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={handleNotificationClose}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}><Typography fontWeight={600}>Notifications</Typography></Box>
          {alerts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}><Security /> <Typography>No alerts</Typography></Box>
          ) : (
            alerts.slice(0, 5).map(alert => (
              <MenuItem key={alert._id} onClick={handleNotificationClose}>
                <Warning sx={{ color: '#f56565', mr: 1 }} /> ${alert.amount} - {alert.riskLevel}
              </MenuItem>
            ))
          )}
          {alerts.length > 0 && <MenuItem onClick={clearAllAlerts}><Close /> Clear all</MenuItem>}
        </Menu>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Welcome */}
          <Card sx={{ mb: 4, background: `linear-gradient(135deg, ${alpha('#667eea', 0.1)} 0%, ${alpha('#f56565', 0.1)} 100%)` }}>
            <CardContent>
              <Typography variant="h5" fontWeight={700}>Welcome back, {user?.name}! 👋</Typography>
              <Typography variant="body2" color="text.secondary">Let's see the more features</Typography>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`, border: `1px solid ${alpha(stat.color, 0.2)}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography color="text.secondary">{stat.title}</Typography>
                      <Avatar sx={{ bgcolor: alpha(stat.color, 0.2), color: stat.color }}>{stat.icon}</Avatar>
                    </Box>
                    <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      {stat.trendUp ? <TrendingUp sx={{ fontSize: 16, color: '#48bb78' }} /> : <TrendingDown sx={{ fontSize: 16, color: '#f56565' }} />}
                      <Typography variant="body2" color={stat.trendUp ? 'success.main' : 'error.main'}>{stat.trend}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/transaction')} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>New Transaction</Button>
            <Button variant="outlined" startIcon={<History />} onClick={() => navigate('/history')}>History</Button>
            <Button variant="outlined" startIcon={<Analytics />} onClick={() => navigate('/analytics')}>Analytics</Button>
            <Button variant="outlined" startIcon={<Settings />} onClick={() => navigate('/security')}>Security</Button>
            <Button variant="outlined" startIcon={<Speed />} onClick={() => navigate('/ai-detection')}>AI Detection</Button>
          </Box>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card><CardContent><Typography variant="h6">Transaction Trend</Typography><Box sx={{ height: 400 }}><Line data={transactionChartData} options={chartOptions} /></Box></CardContent></Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card><CardContent><Typography variant="h6">Risk Distribution</Typography><Box sx={{ height: 300 }}><Doughnut data={riskData} options={chartOptions} /></Box></CardContent></Card>
            </Grid>
          </Grid>

          {/* Recent Transactions & Alerts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Typography variant="h6">Recent Transactions</Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {transactions.slice(0, 5).map(t => (
                    <Box key={t._id} sx={{ p: 2, mb: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), display: 'flex', justifyContent: 'space-between' }}>
                      <Box><Typography fontWeight={600}>${t.amount}</Typography><Typography variant="caption">{new Date(t.timestamp).toLocaleString()}</Typography></Box>
                      <Chip label={t.riskLevel?.toUpperCase()} size="small" sx={{ bgcolor: alpha(t.riskLevel === 'low' ? '#48bb78' : t.riskLevel === 'medium' ? '#ed8936' : '#f56565', 0.2), color: t.riskLevel === 'low' ? '#48bb78' : t.riskLevel === 'medium' ? '#ed8936' : '#f56565' }} />
                    </Box>
                  ))}
                </Box>
                <Button fullWidth variant="outlined" onClick={() => navigate('/history')} sx={{ mt: 2 }}>View All</Button>
              </CardContent></Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Typography variant="h6">Fraud Alerts</Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {alerts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}><Security sx={{ fontSize: 48, color: '#48bb78' }} /><Typography>No alerts</Typography></Box>
                  ) : (
                    alerts.slice(0, 5).map(alert => (
                      <Box key={alert._id} sx={{ p: 2, mb: 1, borderRadius: 2, bgcolor: alpha('#f56565', 0.1), borderLeft: '3px solid #f56565' }}>
                        <Typography variant="body2" fontWeight={600} color="#f56565">⚠️ Fraud Alert</Typography>
                        <Typography variant="body2">${alert.amount} - Risk Score: {alert.fraudScore}</Typography>
                        <Typography variant="caption">Reason: {alert.fraudReason?.join(', ')}</Typography>
                      </Box>
                    ))
                  )}
                </Box>
                {alerts.length > 0 && <Button fullWidth color="error" onClick={clearAllAlerts} sx={{ mt: 2 }}>Clear All</Button>}
              </CardContent></Card>
            </Grid>
          </Grid>
        </Container>

        {/* Mobile FAB */}
        <Zoom in={true}>
          <Fab color="primary" sx={{ position: 'fixed', bottom: 24, right: 24, display: { xs: 'flex', md: 'none' } }} onClick={() => navigate('/transaction')}>
            <Add />
          </Fab>
        </Zoom>
      </Box>

      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}><Shield sx={{ fontSize: 48, color: '#667eea' }} /><Typography variant="h6">FraudShield</Typography></Box>
          <List>
            {menuItems.map(item => (
              <ListItem button key={item.text} onClick={() => { handleItemClick(item.path); handleDrawerToggle(); }}>
                <ListItemIcon>{item.icon}</ListItemIcon><ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Button fullWidth variant="outlined" startIcon={<Logout />} onClick={handleLogout} sx={{ mt: 2 }}>Logout</Button>
        </Box>
      </Drawer>

      {/* Notification Snackbar */}
      <Snackbar open={showNotification} autoHideDuration={5000} onClose={() => setShowNotification(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={notificationSeverity} onClose={() => setShowNotification(false)}>{notificationMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;