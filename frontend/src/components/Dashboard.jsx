// components/Dashboard.jsx - Fixed
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // Removed AnimatePresence
import {
  Box, Grid, Card, CardContent, Typography, IconButton, Avatar, Button,
  Chip, LinearProgress, useTheme, alpha, Badge, Menu, MenuItem, Divider,
  Tooltip, Snackbar, Alert, Fade, Fab, Zoom, AppBar, Toolbar, Container,
  List, ListItem, ListItemIcon, ListItemText, Drawer, useMediaQuery,
  Skeleton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Warning, Security, AccountBalance, AttachMoney,
  Settings, Logout, Add, Notifications, DarkMode, LightMode, Dashboard as DashboardIcon,
  History, Analytics, Speed, Shield, Refresh,
  Menu as MenuIcon, Close, QrCodeScanner,
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
  Title, Tooltip as ChartTooltip, Legend, Filler,
} from 'chart.js';
import { transactionService, authService } from '../services/api';
import { toast } from 'react-toastify';
import { ThemeContext } from '../App';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
  Title, ChartTooltip, Legend, Filler
);

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  // Removed unused isMobile variable
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
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  const sidebarTimeout = useRef(null);

  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, alertsRes, statsRes] = await Promise.all([
        transactionService.getUserTransactions({ limit: 10 }),
        transactionService.getFraudAlerts(),
        transactionService.getTransactionStats(),
      ]);

      setTransactions(transactionsRes.transactions || []);
      setAlerts(alertsRes.alerts || []);
      setStats(statsRes.stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarTimeout.current) clearTimeout(sidebarTimeout.current);
    setSidebarHovered(true);
  };

  const handleSidebarMouseLeave = () => {
    sidebarTimeout.current = setTimeout(() => setSidebarHovered(false), 300);
  };

  const showCenteredNotification = (message, severity = 'info') => {
    setNotificationMessage(message);
    setNotificationSeverity(severity);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleManualRefresh = () => {
    fetchDashboardData();
    showCenteredNotification('Dashboard refreshed!', 'success');
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    toast.success('Logged out successfully');
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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#667eea' },
    { text: 'New Transaction', icon: <Add />, path: '/transaction', color: '#48bb78' },
    { text: 'Transaction History', icon: <History />, path: '/history', color: '#4299e1' },
    { text: 'Fraud Analytics', icon: <Analytics />, path: '/analytics', color: '#ed8936' },
    { text: 'AI Detection', icon: <Speed />, path: '/ai-detection', color: '#9b59b6' },
    { text: 'Security Settings', icon: <Settings />, path: '/security', color: '#f39c12' },
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
      title: 'Risk Score',
      value: user?.fraudScore || 0,
      icon: <Security sx={{ fontSize: 40 }} />,
      color: '#ed8936',
      trend: user?.fraudScore > 50 ? 'Critical' : 'Normal',
      trendUp: user?.fraudScore > 50,
    },
  ];

  const transactionChartData = {
    labels: transactions.slice(0, 7).map(t => new Date(t.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Transaction Amount',
        data: transactions.slice(0, 7).map(t => t.amount),
        borderColor: '#667eea',
        backgroundColor: alpha('#667eea', 0.1),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointBorderColor: 'white',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const riskData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: stats?.riskDistribution?.map(r => r.count) || [65, 20, 10, 5],
        backgroundColor: ['#48bb78', '#ed8936', '#f56565', '#9b2c2c'],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: theme.palette.text.primary, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
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

  const sidebarWidth = sidebarHovered ? 260 : 72;

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop Sidebar - same as original, keep unchanged */}
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
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          zIndex: 1200,
          display: { xs: 'none', md: 'block' },
          boxShadow: sidebarHovered ? '4px 0 20px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <Box sx={{ textAlign: 'center', py: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Shield sx={{ fontSize: sidebarHovered ? 48 : 36, color: theme.palette.primary.main }} />
          {sidebarHovered && (
            <>
              <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>
                FraudShield
              </Typography>
              <Typography variant="caption" color="text.secondary">AI-Powered Security</Typography>
            </>
          )}
        </Box>

        <List sx={{ px: 1.5, py: 2 }}>
          {menuItems.map((item) => (
            <Tooltip key={item.text} title={!sidebarHovered ? item.text : ''} placement="right" arrow>
              <ListItem
                component="div"
                onClick={() => handleItemClick(item.path)}
                sx={{
                  justifyContent: sidebarHovered ? 'flex-start' : 'center',
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.2,
                  cursor: 'pointer',
                  bgcolor: location.pathname === item.path ? alpha(item.color, 0.1) : 'transparent',
                  '&:hover': { bgcolor: alpha(item.color, 0.05) },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: sidebarHovered ? 40 : 'auto', 
                  justifyContent: 'center',
                  color: location.pathname === item.path ? item.color : 'inherit',
                }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarHovered && <ListItemText primary={item.text} />}
              </ListItem>
            </Tooltip>
          ))}
        </List>

        <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Tooltip title={!sidebarHovered ? user?.name : ''} placement="right" arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: sidebarHovered ? 'flex-start' : 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              {sidebarHovered && (
                <Box sx={{ ml: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
                </Box>
              )}
            </Box>
          </Tooltip>
          {sidebarHovered && (
            <Button fullWidth variant="outlined" startIcon={<Logout />} onClick={handleLogout} size="medium">
              Logout
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content - Keep the rest of your original JSX from line 260 onward */}
      <Box sx={{ flexGrow: 1, ml: { xs: 0, md: `${sidebarWidth}px` }, transition: 'margin-left 0.3s ease' }}>
        
        {/* Top Bar */}
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton onClick={handleDrawerToggle} sx={{ display: { md: 'none' }, mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Dashboard</Typography>
            
            <Tooltip title="Scan QR">
              <IconButton onClick={() => setQrDialogOpen(true)}><QrCodeScanner /></IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={handleManualRefresh}><Refresh /></IconButton>
            </Tooltip>
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton onClick={handleNotificationClick}>
                <Badge badgeContent={alerts.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Notification Menu */}
        <Menu 
          anchorEl={notificationAnchor} 
          open={Boolean(notificationAnchor)} 
          onClose={handleNotificationClose}
          PaperProps={{ sx: { maxWidth: 350, borderRadius: 2 } }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontWeight={700}>Notifications</Typography>
            <Chip label={`${alerts.length} new`} size="small" color="error" />
          </Box>
          
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {alerts.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Security sx={{ fontSize: 48, color: '#48bb78', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No new alerts</Typography>
              </Box>
            ) : (
              alerts.slice(0, 5).map((alert, idx) => (
                <MenuItem key={alert._id || idx} onClick={handleNotificationClose} sx={{ whiteSpace: 'normal' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Warning sx={{ color: '#f56565', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>${alert.amount} - {alert.riskLevel?.toUpperCase() || 'High'} Risk</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.fraudReason?.join(', ') || 'Suspicious activity detected'}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))
            )}
          </Box>
          
          {alerts.length > 0 && (
            <>
              <Divider />
              <MenuItem onClick={clearAllAlerts} sx={{ justifyContent: 'center', color: '#f56565' }}>
                <Close fontSize="small" sx={{ mr: 1 }} /> Clear all alerts
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Main Content Container */}
        <Container maxWidth="xl" sx={{ py: 4 }}>
          
          {/* Welcome Banner */}
          <Fade in={true}>
            <Card sx={{ 
              mb: 4, 
              background: `linear-gradient(135deg, ${alpha('#667eea', 0.15)} 0%, ${alpha('#764ba2', 0.15)} 100%)`,
            }}>
              <CardContent>
                <Typography variant="h4" fontWeight={800}>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Your account is protected with AI-powered fraud detection
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Chip label={`${stats?.totalTransactions || 0} Total Transactions`} size="small" />
                  <Chip label={`Risk Score: ${user?.fraudScore || 0}`} size="small" color={user?.fraudScore > 50 ? 'error' : 'success'} />
                </Box>
              </CardContent>
            </Card>
          </Fade>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card sx={{ 
                    background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                    border: `1px solid ${alpha(stat.color, 0.2)}`,
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>{stat.title}</Typography>
                        <Avatar sx={{ bgcolor: alpha(stat.color, 0.2), color: stat.color, width: 48, height: 48 }}>
                          {stat.icon}
                        </Avatar>
                      </Box>
                      <Typography variant="h3" fontWeight={800}>{stat.value}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        {stat.trendUp ? 
                          <TrendingUp sx={{ fontSize: 16, color: '#48bb78' }} /> : 
                          <TrendingDown sx={{ fontSize: 16, color: '#f56565' }} />
                        }
                        <Typography variant="body2" color={stat.trendUp ? 'success.main' : 'error.main'}>
                          {stat.trend}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Quick Action Buttons */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => navigate('/transaction')}
              sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 2 }}
            >
              New Transaction
            </Button>
            <Button variant="outlined" startIcon={<History />} onClick={() => navigate('/history')}>
              History
            </Button>
            <Button variant="outlined" startIcon={<Analytics />} onClick={() => navigate('/analytics')}>
              Analytics
            </Button>
            <Button variant="outlined" startIcon={<Speed />} onClick={() => navigate('/ai-detection')}>
              AI Detection
            </Button>
            <Button variant="outlined" startIcon={<Settings />} onClick={() => navigate('/security')}>
              Security
            </Button>
          </Box>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Transaction Trend</Typography>
                  <Box sx={{ height: 400 }}>
                    <Line data={transactionChartData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Risk Distribution</Typography>
                  <Box sx={{ height: 350 }}>
                    <Doughnut data={riskData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Transactions & Alerts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Transactions</Typography>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {transactions.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">No transactions found</Typography>
                      </Box>
                    ) : (
                      transactions.slice(0, 5).map((t, idx) => (
                        <motion.div
                          key={t._id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Box sx={{ 
                            p: 2, 
                            mb: 1, 
                            borderRadius: 2, 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            <Box>
                              <Typography fontWeight={600}>₹{t.amount}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(t.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                            <Chip 
                              label={t.riskLevel?.toUpperCase() || 'LOW'} 
                              size="small" 
                              sx={{ 
                                bgcolor: alpha(
                                  t.riskLevel === 'low' ? '#48bb78' : 
                                  t.riskLevel === 'medium' ? '#ed8936' : 
                                  t.riskLevel === 'high' ? '#f56565' : '#9b2c2c', 0.2
                                ),
                                color: t.riskLevel === 'low' ? '#48bb78' : 
                                       t.riskLevel === 'medium' ? '#ed8936' : 
                                       t.riskLevel === 'high' ? '#f56565' : '#9b2c2c',
                              }} 
                            />
                          </Box>
                        </motion.div>
                      ))
                    )}
                  </Box>
                  <Button fullWidth variant="outlined" onClick={() => navigate('/history')} sx={{ mt: 2 }}>
                    View All Transactions
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Fraud Alerts</Typography>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {alerts.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Security sx={{ fontSize: 48, color: '#48bb78', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">No active alerts</Typography>
                        <Typography variant="caption" color="text.secondary">Your account is secure</Typography>
                      </Box>
                    ) : (
                      alerts.slice(0, 5).map((alert, idx) => (
                        <motion.div
                          key={alert._id || idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Box sx={{ 
                            p: 2, 
                            mb: 1, 
                            borderRadius: 2, 
                            bgcolor: alpha('#f56565', 0.1),
                            borderLeft: `4px solid ${alert.riskLevel === 'critical' ? '#f56565' : '#ed8936'}`,
                          }}>
                            <Typography variant="body2" fontWeight={600} color="#f56565">
                              ⚠️ {alert.riskLevel?.toUpperCase() || 'HIGH'} Risk Alert
                            </Typography>
                            <Typography variant="body2">Amount: ₹{alert.amount}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Score: {alert.fraudScore || 'N/A'} | {alert.fraudReason?.join(', ') || 'Suspicious pattern detected'}
                            </Typography>
                          </Box>
                        </motion.div>
                      ))
                    )}
                  </Box>
                  {alerts.length > 0 && (
                    <Button fullWidth color="error" onClick={clearAllAlerts} sx={{ mt: 2 }}>
                      Clear All Alerts
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        {/* Mobile FAB */}
        <Zoom in={true}>
          <Fab 
            color="primary" 
            sx={{ position: 'fixed', bottom: 24, right: 24, display: { xs: 'flex', md: 'none' } }} 
            onClick={() => navigate('/transaction')}
          >
            <Add />
          </Fab>
        </Zoom>
      </Box>

      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3, py: 2 }}>
            <Shield sx={{ fontSize: 48, color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight={800}>FraudShield</Typography>
            <Typography variant="caption" color="text.secondary">AI-Powered Security</Typography>
          </Box>
          <List>
            {menuItems.map(item => (
              <ListItem button key={item.text} onClick={() => handleItemClick(item.path)} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ color: item.color }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Button fullWidth variant="outlined" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${user?.email || 'user'}`} 
              alt="QR Code" 
              style={{ borderRadius: 16 }}
            />
          </Box>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Scan this QR code with your mobile device
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar 
        open={showNotification} 
        autoHideDuration={5000} 
        onClose={() => setShowNotification(false)} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notificationSeverity} onClose={() => setShowNotification(false)} variant="filled">
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;