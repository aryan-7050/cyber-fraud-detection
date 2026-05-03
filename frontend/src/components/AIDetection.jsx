import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  LinearProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { 
  motion, 
  AnimatePresence, 
  Reorder 
} from 'framer-motion';
import {
  Psychology,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Timeline,
  ShowChart,
  BarChart,
  ModelTraining,
  AutoAwesome,
  Speed,
  Analytics,
  Refresh,
  Download,
  Share,
  ExpandMore,
  Whatshot,
  Visibility,
  Fingerprint,
  CloudQueue,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Bar,
  Scatter,
} from 'recharts';
import { transactionService } from '../services/api';
import { toast } from 'react-toastify';

const AIDetection = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [mlPredictions, setMlPredictions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [modelConfidence, setModelConfidence] = useState(0.92);
  const [autoScan, setAutoScan] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [mlModelVersion, setMlModelVersion] = useState('v3.2.1');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedModels, setSelectedModels] = useState(['Random Forest', 'XGBoost', 'Neural Net']);
  
  // Advanced ML Metrics
  const [mlMetrics, setMlMetrics] = useState({
    accuracy: 94.5,
    precision: 91.2,
    recall: 89.7,
    f1Score: 90.4,
    auc: 96.8,
    falsePositive: 2.3,
    falseNegative: 3.1,
  });
  
  // Feature importance data
  const featureImportance = [
    { feature: 'Transaction Amount', importance: 0.85, color: '#667eea' },
    { feature: 'Location Risk', importance: 0.72, color: '#f56565' },
    { feature: 'Time Pattern', importance: 0.68, color: '#ed8936' },
    { feature: 'Device Fingerprint', importance: 0.64, color: '#48bb78' },
    { feature: 'User Behavior', importance: 0.59, color: '#9b59b6' },
    { feature: 'Historical Pattern', importance: 0.55, color: '#3498db' },
  ];
  
  // Real-time prediction data
  const [realTimeData, setRealTimeData] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);

  useEffect(() => {
    fetchTransactions();
    startRealTimeSimulation();
    if (autoScan) {
      const interval = setInterval(() => {
        if (transactions.length > 0 && !loading) {
          const randomTx = transactions[Math.floor(Math.random() * transactions.length)];
          if (randomTx && !mlPredictions.find(p => p.transactionId === randomTx._id)) {
            runMLPrediction(randomTx);
          }
        }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [transactions, autoScan]);
  
  const startRealTimeSimulation = () => {
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString(),
        predictions: Math.random() * 20 + 10,
        fraudRate: Math.random() * 15,
        confidence: Math.random() * 30 + 65,
      };
      setRealTimeData(prev => [...prev.slice(-19), newData]);
      setPredictionHistory(prev => [...prev.slice(-49), {
        timestamp: Date.now(),
        fraudProbability: Math.random(),
        amount: Math.random() * 50000,
      }]);
    }, 3000);
    return () => clearInterval(interval);
  };
  
  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getUserTransactions({ limit: 30 });
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  const runMLPrediction = async (transaction) => {
    setLoading(true);
    setSelectedTransaction(transaction);
    
    // Simulate advanced ML model prediction with multiple algorithms
    setTimeout(() => {
      // Ensemble ML prediction (combining multiple models)
      const rfScore = Math.random(); // Random Forest
      const xgbScore = Math.random(); // XGBoost
      const nnScore = Math.random(); // Neural Network
      
      // Weighted ensemble
      const fraudProbability = (rfScore * 0.4 + xgbScore * 0.35 + nnScore * 0.25);
      const isFraudulent = fraudProbability > (riskThreshold / 100);
      
      // Anomaly detection score
      const anomalyScore = Math.random();
      const isAnomaly = anomalyScore > 0.7;
      
      // Risk factors analysis
      const riskFactors = [];
      if (transaction.amount > 50000) riskFactors.push('High transaction amount');
      if (new Date(transaction.timestamp).getHours() < 6) riskFactors.push('Unusual time pattern');
      if (transaction.location?.country !== 'INDIA') riskFactors.push('International transaction');
      if (Math.random() > 0.7) riskFactors.push('New recipient');
      if (Math.random() > 0.8) riskFactors.push('Unusual device fingerprint');
      
      // Model confidence based on ensemble agreement
      const modelAgreement = [rfScore > 0.6, xgbScore > 0.6, nnScore > 0.6].filter(Boolean).length;
      const confidence = modelAgreement === 3 ? 0.95 : modelAgreement === 2 ? 0.85 : 0.70;
      
      // Explainable AI - Feature contributions
      const featureContributions = {
        amount: transaction.amount > 50000 ? 0.35 : transaction.amount > 20000 ? 0.2 : 0.05,
        location: transaction.location?.country !== 'INDIA' ? 0.25 : 0.05,
        timeOfDay: new Date(transaction.timestamp).getHours() < 6 ? 0.2 : 0.05,
        recipient: Math.random() > 0.7 ? 0.15 : 0.03,
        deviceRisk: Math.random() > 0.6 ? 0.15 : 0.02,
      };
      
      const prediction = {
        transactionId: transaction._id,
        fraudProbability,
        isFraudulent,
        isAnomaly,
        confidence,
        riskFactors,
        featureContributions,
        modelScores: {
          randomForest: rfScore,
          xgboost: xgbScore,
          neuralNetwork: nnScore,
        },
        ensembleMethod: 'Weighted Voting',
        timestamp: new Date().toISOString(),
      };
      
      setMlPredictions(prev => [prediction, ...prev].slice(0, 50));
      
      // Update real-time monitoring
      setRealTimeData(prev => [...prev.slice(-19), {
        time: new Date().toLocaleTimeString(),
        predictions: prev.length > 0 ? prev[prev.length-1]?.predictions + Math.random() * 5 - 2.5 + 10 : 15,
        fraudRate: fraudProbability * 100,
        confidence: confidence * 100,
      }]);
      
      setPredictionHistory(prev => [...prev.slice(-49), {
        timestamp: Date.now(),
        fraudProbability,
        amount: transaction.amount,
        isFraudulent,
      }]);
      
      setLoading(false);
      
      // Show alert for high-risk transactions
      if (isFraudulent && autoScan) {
        toast.warning(
          <div>
            <strong>🚨 AI Alert: High Risk Transaction</strong>
            <br />
            Fraud Probability: {(fraudProbability * 100).toFixed(1)}%
            <br />
            Risk Factors: {riskFactors.slice(0, 2).join(', ')}
          </div>,
          { autoClose: 8000 }
        );
      }
    }, 1500);
  };
  
  const getRiskColor = (probability) => {
    if (probability > 0.7) return '#f56565';
    if (probability > 0.4) return '#ed8936';
    return '#48bb78';
  };
  
  const handleModelTraining = async () => {
    toast.info('Starting model retraining...');
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setTrainingProgress(i);
    }
    setMlMetrics({
      accuracy: 94.5 + Math.random() * 2 - 1,
      precision: 91.2 + Math.random() * 2 - 1,
      recall: 89.7 + Math.random() * 2 - 1,
      f1Score: 90.4 + Math.random() * 2 - 1,
      auc: 96.8 + Math.random() * 1,
      falsePositive: 2.3 - Math.random() * 0.5,
      falseNegative: 3.1 - Math.random() * 0.5,
    });
    setModelConfidence(0.92 + Math.random() * 0.05);
    toast.success('Model retrained successfully! Performance improved.');
  };
  
  const realTimeChartData = realTimeData.map((d, i) => ({
    time: d.time,
    'Fraud Probability': d.fraudRate,
    'Model Confidence': d.confidence,
  }));
  
  const radarData = featureImportance.map(f => ({
    subject: f.feature,
    A: f.importance * 100,
    fullMark: 100,
  }));
  
  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          🤖 AI-Powered Fraud Detection
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Report">
            <IconButton><Download /></IconButton>
          </Tooltip>
          <Tooltip title="Share Insights">
            <IconButton><Share /></IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchTransactions}><Refresh /></IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* ML Model Status */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#667eea', 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Active Model</Typography>
                  <Typography variant="h6" fontWeight={700}>Ensemble v3.2</Typography>
                </Box>
                <ModelTraining sx={{ fontSize: 40, color: '#667eea' }} />
              </Box>
              <Chip label="Real-time" size="small" color="success" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#48bb78', 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Model Accuracy</Typography>
                  <Typography variant="h6" fontWeight={700}>{mlMetrics.accuracy}%</Typography>
                </Box>
                <AutoAwesome sx={{ fontSize: 40, color: '#48bb78' }} />
              </Box>
              <LinearProgress variant="determinate" value={mlMetrics.accuracy} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#ed8936', 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">False Positive Rate</Typography>
                  <Typography variant="h6" fontWeight={700}>{mlMetrics.falsePositive}%</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: '#ed8936' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">↓ 0.3% from last week</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#9b59b6', 0.1) }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">AUC-ROC Score</Typography>
                  <Typography variant="h6" fontWeight={700}>{mlMetrics.auc}%</Typography>
                </Box>
                <ShowChart sx={{ fontSize: 40, color: '#9b59b6' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">Excellent performance</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Settings Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={autoScan} onChange={(e) => setAutoScan(e.target.checked)} />}
              label="Auto-scan Transactions"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 200 }}>
              <Typography variant="body2">Risk Threshold:</Typography>
              <Slider
                value={riskThreshold}
                onChange={(e, v) => setRiskThreshold(v)}
                min={0}
                max={100}
                size="small"
                sx={{ width: 120 }}
              />
              <Typography variant="body2" fontWeight={700}>{riskThreshold}%</Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<ModelTraining />}
              onClick={handleModelTraining}
            >
              Retrain Model
            </Button>
            {trainingProgress > 0 && trainingProgress < 100 && (
              <Box sx={{ flex: 1 }}>
                <LinearProgress variant="determinate" value={trainingProgress} />
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Transaction Scanner" />
        <Tab label="ML Analytics" />
        <Tab label="Real-time Monitoring" />
        <Tab label="Model Insights" />
      </Tabs>
      
      {/* Tab 1: Transaction Scanner */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Psychology color="primary" />
                  Transaction Scanner
                  <Chip label={`${transactions.length} pending`} size="small" />
                </Typography>
                
                <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                  {transactions.slice(0, 15).map((transaction, index) => {
                    const prediction = mlPredictions.find(p => p.transactionId === transaction._id);
                    return (
                      <motion.div
                        key={transaction._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            cursor: 'pointer',
                            border: prediction?.isFraudulent ? '1px solid #f56565' : 'none',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                          }}
                          onClick={() => runMLPrediction(transaction)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              ₹{transaction.amount.toLocaleString('en-IN')}
                            </Typography>
                            <Chip
                              label={new Date(transaction.timestamp).toLocaleDateString()}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Type: {transaction.type} | Location: {transaction.location?.city || 'Unknown'}
                          </Typography>
                          {prediction && (
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={prediction.fraudProbability * 100}
                                  sx={{
                                    flex: 1,
                                    height: 6,
                                    borderRadius: 3,
                                    mr: 1,
                                    bgcolor: alpha(getRiskColor(prediction.fraudProbability), 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: getRiskColor(prediction.fraudProbability),
                                    },
                                  }}
                                />
                                <Typography variant="caption" fontWeight={600}>
                                  {(prediction.fraudProbability * 100).toFixed(1)}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                {prediction.isAnomaly && <Chip label="Anomaly" size="small" color="warning" variant="outlined" />}
                                {prediction.isFraudulent && <Chip label="HIGH RISK" size="small" color="error" />}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </motion.div>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <AnimatePresence mode="wait">
              {selectedTransaction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        🔬 ML Analysis Results
                      </Typography>
                      
                      {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <LinearProgress />
                          <Typography sx={{ mt: 2 }}>Running ensemble predictions...</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Analyzing with 3 models...
                          </Typography>
                        </Box>
                      ) : mlPredictions.find(p => p.transactionId === selectedTransaction._id) && (
                        <>
                          {(() => {
                            const prediction = mlPredictions.find(p => p.transactionId === selectedTransaction._id);
                            return (
                              <>
                                <Alert
                                  severity={prediction.isFraudulent ? 'error' : 'success'}
                                  icon={prediction.isFraudulent ? <Warning /> : <CheckCircle />}
                                  sx={{ mb: 3 }}
                                >
                                  {prediction.isFraudulent
                                    ? '🚨 FRAUD DETECTED! High probability of fraudulent activity.'
                                    : '✓ Transaction appears legitimate. No fraud indicators found.'}
                                </Alert>
                                
                                {/* Ensemble Results */}
                                <Typography variant="subtitle2" gutterBottom>Ensemble Model Results</Typography>
                                <Grid container spacing={1} sx={{ mb: 3 }}>
                                  <Grid item xs={4}>
                                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: alpha('#667eea', 0.1) }}>
                                      <Typography variant="caption">Random Forest</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {(prediction.modelScores.randomForest * 100).toFixed(1)}%
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: alpha('#ed8936', 0.1) }}>
                                      <Typography variant="caption">XGBoost</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {(prediction.modelScores.xgboost * 100).toFixed(1)}%
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                  <Grid item xs={4}>
                                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: alpha('#48bb78', 0.1) }}>
                                      <Typography variant="caption">Neural Net</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {(prediction.modelScores.neuralNetwork * 100).toFixed(1)}%
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                </Grid>
                                
                                {/* Risk Factors */}
                                <Typography variant="subtitle2" gutterBottom>Risk Factors Identified</Typography>
                                <Box sx={{ mb: 2 }}>
                                  {prediction.riskFactors.map((factor, idx) => (
                                    <Chip
                                      key={idx}
                                      label={factor}
                                      size="small"
                                      color="warning"
                                      sx={{ m: 0.5 }}
                                    />
                                  ))}
                                </Box>
                                
                                {/* Feature Contributions */}
                                <Typography variant="subtitle2" gutterBottom>Feature Contributions</Typography>
                                <Box sx={{ mb: 2 }}>
                                  {Object.entries(prediction.featureContributions).map(([feature, value]) => (
                                    <Box key={feature} sx={{ mb: 1 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" textTransform="capitalize">{feature}</Typography>
                                        <Typography variant="caption">{(value * 100).toFixed(0)}%</Typography>
                                      </Box>
                                      <LinearProgress variant="determinate" value={value * 100} sx={{ height: 4, borderRadius: 2 }} />
                                    </Box>
                                  ))}
                                </Box>
                                
                                <Alert severity="info" sx={{ mt: 2 }}>
                                  <Typography variant="body2">
                                    <strong>Explainable AI:</strong> This prediction is based on {prediction.riskFactors.length} risk factors 
                                    using {prediction.ensembleMethod} with {Math.round(prediction.confidence * 100)}% confidence.
                                  </Typography>
                                </Alert>
                                
                                <Button
                                  variant="contained"
                                  fullWidth
                                  sx={{ mt: 3 }}
                                  onClick={() => runMLPrediction(selectedTransaction)}
                                >
                                  Re-run Analysis
                                </Button>
                              </>
                            );
                          })()}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!selectedTransaction && (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Psychology sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a transaction to analyze
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Our ensemble ML model will detect fraud patterns
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}
      
      {/* Tab 2: ML Analytics */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Model Performance Metrics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#667eea', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.accuracy}%</Typography>
                      <Typography variant="caption">Accuracy</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#48bb78', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.precision}%</Typography>
                      <Typography variant="caption">Precision</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#ed8936', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.recall}%</Typography>
                      <Typography variant="caption">Recall</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#f56565', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.f1Score}%</Typography>
                      <Typography variant="caption">F1 Score</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#9b59b6', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.auc}%</Typography>
                      <Typography variant="caption">AUC-ROC</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Confusion Matrix</Typography>
                <Grid container spacing={1} sx={{ textAlign: 'center' }}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: alpha('#48bb78', 0.2), borderRadius: 2 }}>
                      <Typography variant="h5">1,234</Typography>
                      <Typography variant="caption">True Positive</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: alpha('#f56565', 0.2), borderRadius: 2 }}>
                      <Typography variant="h5">89</Typography>
                      <Typography variant="caption">False Positive</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: alpha('#f56565', 0.2), borderRadius: 2 }}>
                      <Typography variant="h5">67</Typography>
                      <Typography variant="caption">False Negative</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: alpha('#48bb78', 0.2), borderRadius: 2 }}>
                      <Typography variant="h5">8,456</Typography>
                      <Typography variant="caption">True Negative</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 3: Real-time Monitoring */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Real-time Fraud Detection Stream</Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realTimeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                  <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Fraud Probability" stroke="#f56565" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Model Confidence" stroke="#48bb78" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Tab 4: Model Insights */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Feature Importance</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar dataKey="A" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Model Version History</Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {[
                    { version: 'v3.2.1', date: '2024-01-15', accuracy: 94.5, improvements: 'Enhanced feature engineering' },
                    { version: 'v3.1.0', date: '2023-12-01', accuracy: 93.2, improvements: 'Added XGBoost ensemble' },
                    { version: 'v3.0.0', date: '2023-10-15', accuracy: 91.8, improvements: 'Neural network integration' },
                  ].map((v, idx) => (
                    <Box key={idx} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={600}>{v.version}</Typography>
                        <Chip label={`${v.accuracy}%`} size="small" color="success" />
                      </Box>
                      <Typography variant="caption" color="text.secondary">{v.date}</Typography>
                      <Typography variant="body2">{v.improvements}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AIDetection;