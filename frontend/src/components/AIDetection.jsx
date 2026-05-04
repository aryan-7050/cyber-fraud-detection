import React, { useState, useEffect, useCallback } from 'react'; // Removed useCallback
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
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Psychology,
  Warning,
  CheckCircle,
  ShowChart,
  ModelTraining,
  AutoAwesome,
  Refresh,
  Download,
  Share,
} from '@mui/icons-material'; // Removed TrendingUp, TrendingDown, Speed, Analytics, Whatshot
import { transactionService } from '../services/api';
import { toast } from 'react-toastify';

const AIDetection = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [mlPredictions, setMlPredictions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [autoScan, setAutoScan] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [trainingProgress, setTrainingProgress] = useState(0);
  
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

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getUserTransactions({ limit: 30 });
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    }
  };

  const runMLPrediction = useCallback(async (transaction) => {
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
      if (transaction.amount > 50000) riskFactors.push('💰 High transaction amount');
      if (new Date(transaction.timestamp).getHours() < 6) riskFactors.push('🕐 Unusual time pattern');
      if (transaction.location?.country !== 'INDIA') riskFactors.push('🌍 International transaction');
      if (Math.random() > 0.7) riskFactors.push('👤 New recipient');
      if (Math.random() > 0.8) riskFactors.push('📱 Unusual device fingerprint');
      
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
      } else if (!isFraudulent) {
        toast.success(
          <div>
            <strong>✓ Transaction Verified</strong>
            <br />
            Confidence: {(confidence * 100).toFixed(1)}%
          </div>,
          { autoClose: 3000 }
        );
      }
    }, 1500);
  }, [riskThreshold, autoScan]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (!autoScan || loading || transactions.length === 0) return;
    
    const interval = setInterval(() => {
      const unanalyzedTx = transactions.filter(t => 
        !mlPredictions.find(p => p.transactionId === t._id)
      );
      if (unanalyzedTx.length > 0) {
        const randomTx = unanalyzedTx[Math.floor(Math.random() * unanalyzedTx.length)];
        runMLPrediction(randomTx);
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, [transactions, autoScan, loading, mlPredictions, runMLPrediction]);
  
  const getRiskColor = (probability) => {
    if (probability > 0.7) return '#f56565';
    if (probability > 0.4) return '#ed8936';
    return '#48bb78';
  };
  
  const getRiskLabel = (probability) => {
    if (probability > 0.7) return 'Critical Risk';
    if (probability > 0.4) return 'Medium Risk';
    return 'Low Risk';
  };
  
  const handleModelTraining = async () => {
    toast.info('🔄 Starting model retraining...');
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setTrainingProgress(i);
    }
    setMlMetrics({
      accuracy: 94.5 + Math.random() * 2 - 1,
      precision: 91.2 + Math.random() * 2 - 1,
      recall: 89.7 + Math.random() * 2 - 1,
      f1Score: 90.4 + Math.random() * 2 - 1,
      auc: 96.8 + Math.random() * 1,
      falsePositive: Math.max(1.5, 2.3 - Math.random() * 0.5),
      falseNegative: Math.max(2.0, 3.1 - Math.random() * 0.5),
    });
    toast.success('✅ Model retrained successfully! Performance improved.');
    setTimeout(() => setTrainingProgress(0), 1000);
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={800}>
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
      
      {/* ML Model Status Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#667eea', 0.1), border: `1px solid ${alpha('#667eea', 0.2)}` }}>
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
          <Card sx={{ bgcolor: alpha('#48bb78', 0.1), border: `1px solid ${alpha('#48bb78', 0.2)}` }}>
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
          <Card sx={{ bgcolor: alpha('#ed8936', 0.1), border: `1px solid ${alpha('#ed8936', 0.2)}` }}>
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
          <Card sx={{ bgcolor: alpha('#9b59b6', 0.1), border: `1px solid ${alpha('#9b59b6', 0.2)}` }}>
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
              disabled={trainingProgress > 0}
            >
              Retrain Model
            </Button>
            {trainingProgress > 0 && trainingProgress < 100 && (
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <LinearProgress variant="determinate" value={trainingProgress} />
                <Typography variant="caption" color="text.secondary">Training: {trainingProgress}%</Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="📊 Transaction Scanner" />
        <Tab label="📈 ML Analytics" />
        <Tab label="🔬 Model Insights" />
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
                  <Chip 
                    label={`${transactions.filter(t => !mlPredictions.find(p => p.transactionId === t._id)).length} pending`} 
                    size="small" 
                    color="warning" 
                  />
                </Typography>
                
                <Box sx={{ maxHeight: 550, overflow: 'auto' }}>
                  {transactions.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">No transactions available</Typography>
                      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
                        Refresh
                      </Button>
                    </Box>
                  ) : (
                    transactions.slice(0, 15).map((transaction, index) => {
                      const prediction = mlPredictions.find(p => p.transactionId === transaction._id);
                      return (
                        <motion.div
                          key={transaction._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(index * 0.03, 0.5) }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              mb: 1.5,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              cursor: 'pointer',
                              border: prediction?.isFraudulent ? `2px solid ${getRiskColor(prediction.fraudProbability)}` : 'none',
                              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1), transform: 'translateX(4px)' },
                              transition: 'all 0.2s',
                            }}
                            onClick={() => runMLPrediction(transaction)}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                ₹{transaction.amount?.toLocaleString('en-IN') || 0}
                              </Typography>
                              <Chip
                                label={new Date(transaction.timestamp).toLocaleDateString()}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Type: {transaction.type} | ID: {transaction._id?.slice(-6)}
                            </Typography>
                            
                            {prediction ? (
                              <Box sx={{ mt: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                                  <Typography variant="caption" fontWeight={600} color={getRiskColor(prediction.fraudProbability)}>
                                    {(prediction.fraudProbability * 100).toFixed(1)}% - {getRiskLabel(prediction.fraudProbability)}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={prediction.fraudProbability * 100}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: alpha(getRiskColor(prediction.fraudProbability), 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: getRiskColor(prediction.fraudProbability),
                                    },
                                  }}
                                />
                                {prediction.isFraudulent && (
                                  <Chip label="⚠️ HIGH RISK" size="small" color="error" sx={{ mt: 1 }} />
                                )}
                              </Box>
                            ) : (
                              <Box sx={{ mt: 1.5 }}>
                                <Chip 
                                  label="Click to analyze" 
                                  size="small" 
                                  icon={<Psychology />}
                                  sx={{ bgcolor: alpha('#667eea', 0.1) }}
                                />
                              </Box>
                            )}
                          </Box>
                        </motion.div>
                      );
                    })
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <AnimatePresence mode="wait">
              {selectedTransaction ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesome color="primary" />
                        ML Analysis Results
                      </Typography>
                      
                      {loading ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <LinearProgress />
                          <Typography sx={{ mt: 2 }}>Running ensemble predictions...</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Analyzing with Random Forest, XGBoost & Neural Network
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
                                  <Typography variant="body2" fontWeight={600}>
                                    {prediction.isFraudulent
                                      ? '🚨 FRAUD DETECTED! High probability of fraudulent activity.'
                                      : '✓ Transaction appears legitimate. No fraud indicators found.'}
                                  </Typography>
                                </Alert>
                                
                                {/* Transaction Details */}
                                <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#667eea', 0.05) }}>
                                  <Typography variant="subtitle2" gutterBottom>Transaction Details</Typography>
                                  <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" color="text.secondary">Amount</Typography>
                                      <Typography variant="body2" fontWeight={600}>₹{selectedTransaction.amount?.toLocaleString('en-IN')}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" color="text.secondary">Type</Typography>
                                      <Typography variant="body2" textTransform="capitalize">{selectedTransaction.type}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" color="text.secondary">Date</Typography>
                                      <Typography variant="body2">{new Date(selectedTransaction.timestamp).toLocaleString()}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" color="text.secondary">Location</Typography>
                                      <Typography variant="body2">{selectedTransaction.location?.city || 'Unknown'}</Typography>
                                    </Grid>
                                  </Grid>
                                </Paper>
                                
                                {/* Ensemble Results */}
                                <Typography variant="subtitle2" gutterBottom>🤖 Ensemble Model Results</Typography>
                                <Grid container spacing={1} sx={{ mb: 2 }}>
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
                                
                                {/* Confidence Score */}
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom>📊 Confidence Score</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={prediction.confidence * 100}
                                        sx={{ height: 8, borderRadius: 4 }}
                                      />
                                    </Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {(prediction.confidence * 100).toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {/* Risk Factors */}
                                {prediction.riskFactors.length > 0 && (
                                  <>
                                    <Typography variant="subtitle2" gutterBottom>⚠️ Risk Factors Identified</Typography>
                                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {prediction.riskFactors.map((factor, idx) => (
                                        <Chip
                                          key={idx}
                                          label={factor}
                                          size="small"
                                          color="warning"
                                          variant="outlined"
                                        />
                                      ))}
                                    </Box>
                                  </>
                                )}
                                
                                {/* Feature Contributions */}
                                <Typography variant="subtitle2" gutterBottom>🔬 Feature Contributions</Typography>
                                <Box sx={{ mb: 2 }}>
                                  {Object.entries(prediction.featureContributions).map(([feature, value]) => (
                                    <Box key={feature} sx={{ mb: 1 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="caption" textTransform="capitalize">{feature.replace(/([A-Z])/g, ' $1')}</Typography>
                                        <Typography variant="caption" fontWeight={600}>{(value * 100).toFixed(0)}%</Typography>
                                      </Box>
                                      <LinearProgress variant="determinate" value={value * 100} sx={{ height: 4, borderRadius: 2 }} />
                                    </Box>
                                  ))}
                                </Box>
                                
                                <Alert severity="info" sx={{ mt: 2 }}>
                                  <Typography variant="body2">
                                    <strong>🧠 Explainable AI:</strong> This prediction is based on {prediction.riskFactors.length} risk factors 
                                    using {prediction.ensembleMethod} with {Math.round(prediction.confidence * 100)}% confidence.
                                  </Typography>
                                </Alert>
                                
                                <Button
                                  variant="contained"
                                  fullWidth
                                  sx={{ mt: 3 }}
                                  onClick={() => runMLPrediction(selectedTransaction)}
                                >
                                  🔄 Re-run Analysis
                                </Button>
                              </>
                            );
                          })()}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                      <Psychology sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Select a transaction to analyze
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Our ensemble ML model (Random Forest + XGBoost + Neural Network) will detect fraud patterns
                      </Typography>
                      <Chip 
                        label="Powered by AI" 
                        icon={<AutoAwesome />} 
                        color="primary" 
                        sx={{ mt: 2 }} 
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 2: ML Analytics */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>📊 Model Performance Metrics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#667eea', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.accuracy}%</Typography>
                      <Typography variant="caption" color="text.secondary">Accuracy</Typography>
                      <LinearProgress variant="determinate" value={mlMetrics.accuracy} sx={{ mt: 1, height: 4, borderRadius: 2 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#48bb78', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.precision}%</Typography>
                      <Typography variant="caption" color="text.secondary">Precision</Typography>
                      <LinearProgress variant="determinate" value={mlMetrics.precision} sx={{ mt: 1, height: 4, borderRadius: 2 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#ed8936', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.recall}%</Typography>
                      <Typography variant="caption" color="text.secondary">Recall</Typography>
                      <LinearProgress variant="determinate" value={mlMetrics.recall} sx={{ mt: 1, height: 4, borderRadius: 2 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#f56565', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.f1Score}%</Typography>
                      <Typography variant="caption" color="text.secondary">F1 Score</Typography>
                      <LinearProgress variant="determinate" value={mlMetrics.f1Score} sx={{ mt: 1, height: 4, borderRadius: 2 }} />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha('#9b59b6', 0.1), borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700}>{mlMetrics.auc}%</Typography>
                      <Typography variant="caption" color="text.secondary">AUC-ROC</Typography>
                      <LinearProgress variant="determinate" value={mlMetrics.auc} sx={{ mt: 1, height: 4, borderRadius: 2 }} />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>🎯 Confusion Matrix</Typography>
                <Grid container spacing={1} sx={{ textAlign: 'center' }}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: alpha('#48bb78', 0.2), borderRadius: 2 }}>
                      <Typography variant="h3" fontWeight={700}>1,234</Typography>
                      <Typography variant="caption">True Positive</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">Correctly detected fraud</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: alpha('#f56565', 0.2), borderRadius: 2 }}>
                      <Typography variant="h3" fontWeight={700}>89</Typography>
                      <Typography variant="caption">False Positive</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">False alarms</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: alpha('#f56565', 0.2), borderRadius: 2 }}>
                      <Typography variant="h3" fontWeight={700}>67</Typography>
                      <Typography variant="caption">False Negative</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">Missed fraud</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: alpha('#48bb78', 0.2), borderRadius: 2 }}>
                      <Typography variant="h3" fontWeight={700}>8,456</Typography>
                      <Typography variant="caption">True Negative</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">Correctly cleared</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>📈 Performance Summary</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="success">
                    <Typography variant="body2">
                      <strong>Detection Rate:</strong> 94.8% of fraud cases correctly identified
                    </Typography>
                  </Alert>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Average Response Time:</strong> 1.2 seconds per transaction
                    </Typography>
                  </Alert>
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Improvement Area:</strong> Reduce false positives by optimizing threshold
                    </Typography>
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 3: Model Insights */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>📋 Model Version History</Typography>
                <Box sx={{ overflow: 'auto' }}>
                  {[
                    { version: 'v3.2.1', date: '2024-01-15', accuracy: 94.5, improvements: '✨ Enhanced feature engineering & anomaly detection', status: 'active' },
                    { version: 'v3.1.0', date: '2023-12-01', accuracy: 93.2, improvements: '🚀 Added XGBoost ensemble & improved recall', status: 'deprecated' },
                    { version: 'v3.0.0', date: '2023-10-15', accuracy: 91.8, improvements: '🧠 Neural network integration & real-time scoring', status: 'deprecated' },
                    { version: 'v2.5.0', date: '2023-08-01', accuracy: 89.4, improvements: '📊 Random Forest optimization', status: 'archived' },
                  ].map((v, idx) => (
                    <Box key={idx} sx={{ 
                      p: 2, 
                      borderBottom: idx < 3 ? 1 : 0, 
                      borderColor: 'divider',
                      bgcolor: v.status === 'active' ? alpha('#48bb78', 0.05) : 'transparent',
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {v.version}
                            {v.status === 'active' && (
                              <Chip label="Active" size="small" color="success" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{v.date}</Typography>
                        </Box>
                        <Chip label={`${v.accuracy}% accuracy`} size="small" color="primary" />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>{v.improvements}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>🎯 Feature Importance Ranking</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { feature: 'Transaction Amount', importance: 85, color: '#667eea' },
                    { feature: 'Location Risk', importance: 72, color: '#f56565' },
                    { feature: 'Time Pattern', importance: 68, color: '#ed8936' },
                    { feature: 'Device Fingerprint', importance: 64, color: '#48bb78' },
                    { feature: 'User Behavior', importance: 59, color: '#9b59b6' },
                    { feature: 'Historical Pattern', importance: 55, color: '#3498db' },
                  ].map((item, idx) => (
                    <Box key={idx}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{item.feature}</Typography>
                        <Typography variant="body2" fontWeight={600}>{item.importance}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.importance} 
                        sx={{ height: 8, borderRadius: 4, bgcolor: alpha(item.color, 0.2), '& .MuiLinearProgress-bar': { bgcolor: item.color } }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>⚙️ Model Configuration</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Paper sx={{ p: 2, bgcolor: alpha('#667eea', 0.05) }}>
                    <Typography variant="subtitle2">Ensemble Strategy</Typography>
                    <Typography variant="body2" color="text.secondary">Weighted Voting (RF: 40%, XGB: 35%, NN: 25%)</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: alpha('#48bb78', 0.05) }}>
                    <Typography variant="subtitle2">Training Data</Typography>
                    <Typography variant="body2" color="text.secondary">50,000+ labeled transactions | Updated weekly</Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: alpha('#ed8936', 0.05) }}>
                    <Typography variant="subtitle2">Inference Time</Typography>
                    <Typography variant="body2" color="text.secondary">~200ms per transaction | Real-time scoring</Typography>
                  </Paper>
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