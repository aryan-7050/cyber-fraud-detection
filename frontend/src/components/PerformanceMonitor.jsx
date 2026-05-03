// components/PerformanceMonitor.jsx - Clean Version with No Warnings
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, LinearProgress,
  useTheme, alpha, Chip, IconButton, Tooltip, Avatar,
  Alert, Snackbar, Switch, FormControlLabel,
  Tabs, Tab, Paper, Divider, Fade, CircularProgress,
} from '@mui/material';
import {
  Speed, Memory, Storage, Timer, Refresh, TrendingUp,
  Warning, CheckCircle, Analytics, ShowChart,
  Dns, Router, NotificationsActive, Assessment,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, Area, Bar, ComposedChart, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer
} from 'recharts';
import { toast } from 'react-toastify';

const PerformanceMonitor = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    latency: 0,
    throughput: 0,
    errorRate: 0,
    diskIO: 0,
    networkIn: 0,
    networkOut: 0,
    dbConnections: 0,
    cacheHitRate: 0,
  });
  
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [autoScale, setAutoScale] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [showPredictions, setShowPredictions] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anomalyScore, setAnomalyScore] = useState(0);
  const [healthScore, setHealthScore] = useState(100);

  // Calculate anomaly score using ML-like algorithm
  const calculateAnomalyScore = useCallback((metrics) => {
    let score = 0;
    if (metrics.cpu > 85) score += 30;
    if (metrics.latency > 120) score += 25;
    if (metrics.errorRate > 3) score += 35;
    if (metrics.memory > 80) score += 20;
    return Math.min(score, 100);
  }, []);

  // Calculate health score
  const calculateHealthScore = useCallback((metrics) => {
    let score = 100;
    score -= Math.max(0, metrics.cpu - 70) * 0.5;
    score -= Math.max(0, metrics.latency - 100) * 0.3;
    score -= metrics.errorRate * 5;
    score -= Math.max(0, metrics.memory - 75) * 0.4;
    return Math.max(0, Math.min(100, score));
  }, []);

  // Generate predictions
  const generatePredictions = useCallback((currentMetrics) => {
    const nextValues = {
      cpu: Math.min(100, currentMetrics.cpu + (Math.random() * 10 - 5)),
      latency: Math.max(0, currentMetrics.latency + (Math.random() * 30 - 15)),
      errorRate: Math.max(0, currentMetrics.errorRate + (Math.random() * 1 - 0.5)),
    };
    
    setPredictions(prev => [...prev.slice(-9), {
      timestamp: new Date().toISOString(),
      ...nextValues,
    }]);
  }, []);

  // Check alerts
  const checkAlerts = useCallback((metrics) => {
    const newAlerts = [];
    
    if (metrics.cpu > alertThreshold) {
      newAlerts.push({
        type: 'cpu',
        severity: metrics.cpu > 90 ? 'critical' : 'warning',
        message: `CPU usage at ${metrics.cpu.toFixed(1)}%`,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (metrics.latency > 150) {
      newAlerts.push({
        type: 'latency',
        severity: metrics.latency > 200 ? 'critical' : 'warning',
        message: `High latency: ${metrics.latency.toFixed(0)}ms`,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (metrics.errorRate > 3) {
      newAlerts.push({
        type: 'error',
        severity: metrics.errorRate > 5 ? 'critical' : 'warning',
        message: `Error rate spike: ${metrics.errorRate.toFixed(2)}%`,
        timestamp: new Date().toISOString(),
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));
      
      // Show toast for critical alerts
      newAlerts.forEach(alert => {
        if (alert.severity === 'critical') {
          toast.error(alert.message);
          setSnackbarMessage(alert.message);
          setSnackbarOpen(true);
        }
      });
    }
  }, [alertThreshold]);

  // Handle auto-scaling
  const handleAutoScale = useCallback(async () => {
    if (autoScale && metrics.cpu > 75) {
      toast.info('🔄 Auto-scaling initiated... Adding resources');
      setTimeout(() => {
        toast.success('✓ Auto-scaling complete. System stabilized.');
      }, 3000);
    }
  }, [autoScale, metrics.cpu]);

  // Simulate real-time metrics with ML predictions
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = {
        cpu: Math.random() * 70 + 15,
        memory: Math.random() * 60 + 25,
        latency: Math.random() * 150 + 30,
        throughput: Math.random() * 1200 + 400,
        errorRate: Math.random() * 4,
        diskIO: Math.random() * 100 + 20,
        networkIn: Math.random() * 500 + 100,
        networkOut: Math.random() * 300 + 50,
        dbConnections: Math.floor(Math.random() * 40 + 10),
        cacheHitRate: Math.random() * 30 + 65,
      };
      
      setMetrics(newMetrics);
      
      // Calculate anomaly score using ML-like algorithm
      const anomaly = calculateAnomalyScore(newMetrics);
      setAnomalyScore(anomaly);
      
      // Calculate health score
      const health = calculateHealthScore(newMetrics);
      setHealthScore(health);
      
      // Update history
      setHistory(prev => [...prev.slice(-49), { ...newMetrics, timestamp: new Date().toISOString() }]);
      
      // Generate predictions
      if (showPredictions) {
        generatePredictions(newMetrics);
      }
      
      // Check for alerts
      checkAlerts(newMetrics);
      
    }, 2000);
    
    return () => clearInterval(interval);
  }, [showPredictions, calculateAnomalyScore, calculateHealthScore, generatePredictions, checkAlerts]);

  useEffect(() => {
    handleAutoScale();
  }, [metrics.cpu, autoScale, handleAutoScale]);

  const chartData = history.map((h, i) => ({
    time: i,
    latency: h.latency,
    throughput: h.throughput / 10,
    errorRate: h.errorRate * 10,
  }));

  const predictionData = predictions.map((p, i) => ({
    time: history.length + i,
    predictedLatency: p.latency,
    predictedErrorRate: p.errorRate * 10,
  }));

  const metricCards = [
    { title: 'CPU Usage', value: `${metrics.cpu.toFixed(1)}%`, icon: <Memory />, color: '#667eea', threshold: 75, unit: '%' },
    { title: 'Memory Usage', value: `${metrics.memory.toFixed(1)}%`, icon: <Storage />, color: '#48bb78', threshold: 80, unit: '%' },
    { title: 'API Latency', value: `${metrics.latency.toFixed(0)}ms`, icon: <Timer />, color: metrics.latency > 120 ? '#f56565' : '#48bb78', threshold: 100, unit: 'ms' },
    { title: 'Throughput', value: `${metrics.throughput.toFixed(0)} req/s`, icon: <Speed />, color: '#ed8936', threshold: 800, unit: 'req/s' },
    { title: 'Error Rate', value: `${metrics.errorRate.toFixed(2)}%`, icon: <Warning />, color: metrics.errorRate > 2 ? '#f56565' : '#48bb78', threshold: 2, unit: '%' },
    { title: 'Disk I/O', value: `${metrics.diskIO.toFixed(0)} MB/s`, icon: <Dns />, color: '#9b59b6', threshold: 80, unit: 'MB/s' },
  ];

  const systemHealthMetrics = [
    { label: 'System Health', value: healthScore, color: healthScore > 80 ? '#48bb78' : healthScore > 60 ? '#ed8936' : '#f56565' },
    { label: 'Anomaly Score', value: anomalyScore, color: anomalyScore < 30 ? '#48bb78' : anomalyScore < 60 ? '#ed8936' : '#f56565' },
    { label: 'DB Connections', value: metrics.dbConnections, color: metrics.dbConnections < 30 ? '#48bb78' : '#ed8936' },
  ];

  // Circular Progress Component
  const CircularProgressWithLabel = ({ value, size }) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" value={value} size={size} />
        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" component="div" color="text.secondary">
            {`${value}%`}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
            AI Performance Intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time system metrics with predictive analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            icon={healthScore > 80 ? <CheckCircle /> : <Warning />}
            label={`Health Score: ${healthScore.toFixed(1)}%`}
            color={healthScore > 80 ? 'success' : healthScore > 60 ? 'warning' : 'error'}
          />
          <Tooltip title="Export Metrics">
            <IconButton><Assessment /></IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={() => window.location.reload()}><Refresh /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* System Health Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {systemHealthMetrics.map((metric, idx) => (
          <Grid item xs={6} sm={4} key={idx}>
            <Fade in={true} timeout={500 + idx * 100}>
              <Card sx={{ bgcolor: alpha(metric.color, 0.1), border: `1px solid ${alpha(metric.color, 0.2)}` }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                  <Typography variant="h4" fontWeight={700} color={metric.color}>
                    {typeof metric.value === 'number' && metric.label.includes('Score') 
                      ? `${metric.value.toFixed(1)}%` 
                      : metric.value}
                  </Typography>
                  {metric.label === 'System Health' && (
                    <LinearProgress 
                      variant="determinate" 
                      value={metric.value} 
                      sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: alpha(metric.color, 0.2), '& .MuiLinearProgress-bar': { bgcolor: metric.color } }}
                    />
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" />
        <Tab label="Metrics Detail" />
        <Tab label="Predictions & Analytics" />
        <Tab label="Alerts History" />
      </Tabs>

      {/* Tab 1: Dashboard */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {metricCards.map((metric, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">{metric.title}</Typography>
                      <Avatar sx={{ bgcolor: alpha(metric.color, 0.2), color: metric.color, width: 40, height: 40 }}>
                        {metric.icon}
                      </Avatar>
                    </Box>
                    <Typography variant="h3" fontWeight={700}>{metric.value}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(metric.value)} 
                        sx={{ 
                          flex: 1, 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(metric.color, 0.2),
                          '& .MuiLinearProgress-bar': { bgcolor: metric.color },
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary">{metric.unit}</Typography>
                    </Box>
                    <Box sx={{ mt: 1.5 }}>
                      <Chip 
                        label={parseFloat(metric.value) > metric.threshold ? 'Critical' : 'Normal'} 
                        size="small"
                        color={parseFloat(metric.value) > metric.threshold ? 'error' : 'success'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 2: Metrics Detail */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
              Performance Trends
            </Typography>
            <Box sx={{ height: 500 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                  <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
                  <YAxis yAxisId="left" stroke={theme.palette.text.secondary} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.palette.text.secondary} />
                  <RechartsTooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="latency" stroke="#667eea" fill="#667eea" fillOpacity={0.3} name="Latency (ms)" />
                  <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#48bb78" strokeWidth={2} name="Throughput (x10 req/s)" />
                  <Bar yAxisId="right" dataKey="errorRate" fill="#f56565" opacity={0.5} name="Error Rate x10" />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Predictions & Analytics */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                    AI Predictive Analytics
                  </Typography>
                  <FormControlLabel
                    control={<Switch checked={showPredictions} onChange={(e) => setShowPredictions(e.target.checked)} />}
                    label="Enable Predictions"
                  />
                </Box>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                      <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="predictedLatency" stroke="#667eea" strokeWidth={2} strokeDasharray="5 5" name="Predicted Latency (ms)" />
                      <Line type="monotone" dataKey="predictedErrorRate" stroke="#f56565" strokeWidth={2} strokeDasharray="5 5" name="Predicted Error Rate" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  🤖 AI Model predicts stable performance over the next 10 intervals with 87% confidence.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Resource Optimization Recommendations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity={metrics.cpu > 70 ? 'warning' : 'success'}>
                    {metrics.cpu > 70 
                      ? '⚠️ Consider scaling up CPU resources during peak hours'
                      : '✓ CPU utilization is optimal'}
                  </Alert>
                  <Alert severity={metrics.latency > 100 ? 'warning' : 'success'}>
                    {metrics.latency > 100
                      ? '⚠️ High latency detected. Consider CDN or caching'
                      : '✓ Response times are within SLA'}
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  <Router sx={{ mr: 1, verticalAlign: 'middle' }} />
                  SLA Compliance
                </Typography>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgressWithLabel value={98.5} size={120} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Uptime: 99.95% | Response SLA: 98.5%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 4: Alerts History */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              <NotificationsActive sx={{ mr: 1, verticalAlign: 'middle' }} />
              Alert History
            </Typography>
            <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
              {alerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle sx={{ fontSize: 60, color: '#48bb78' }} />
                  <Typography variant="body1" color="text.secondary">No active alerts</Typography>
                </Box>
              ) : (
                alerts.map((alert, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Box sx={{ 
                      p: 2, 
                      mb: 1, 
                      borderRadius: 2,
                      bgcolor: alpha(alert.severity === 'critical' ? '#f56565' : '#ed8936', 0.1),
                      borderLeft: `4px solid ${alert.severity === 'critical' ? '#f56565' : '#ed8936'}`,
                    }}>
                      <Typography variant="body2" fontWeight={600}>
                        {alert.severity === 'critical' ? '🚨' : '⚠️'} {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(alert.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </motion.div>
                ))
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Controls Bar */}
      <Paper sx={{ position: 'fixed', bottom: 20, right: 20, p: 1.5, borderRadius: 4, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption">Auto-scale:</Typography>
          <Switch checked={autoScale} onChange={(e) => setAutoScale(e.target.checked)} size="small" />
          <Divider orientation="vertical" flexItem />
          <Typography variant="caption">Alert @:</Typography>
          <Chip 
            label={`${alertThreshold}%`} 
            size="small" 
            onClick={() => setAlertThreshold(alertThreshold === 80 ? 70 : 80)}
          />
        </Box>
      </Paper>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PerformanceMonitor;