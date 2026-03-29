import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Psychology } from '@mui/icons-material';
import { transactionService } from '../services/api';

const AIDetection = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [mlPredictions, setMlPredictions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getUserTransactions({ limit: 20 });
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const runMLPrediction = async (transaction) => {
    setLoading(true);
    setSelectedTransaction(transaction);
    
    // Simulate ML model prediction
    setTimeout(() => {
      const fraudProbability = Math.random();
      const isFraudulent = fraudProbability > 0.7;
      const confidenceScore = isFraudulent 
        ? 0.7 + Math.random() * 0.3 
        : 0.8 + Math.random() * 0.2;
      
      setMlPredictions([
        {
          transactionId: transaction._id,
          fraudProbability,
          isFraudulent,
          confidence: confidenceScore,
          features: {
            amount: transaction.amount,
            timeOfDay: new Date(transaction.timestamp).getHours(),
            locationRisk: Math.random() > 0.5 ? 'high' : 'low',
            patternAnomaly: fraudProbability > 0.6,
          },
        },
        ...mlPredictions,
      ]);
      setLoading(false);
    }, 2000);
  };

  const getRiskColor = (probability) => {
    if (probability > 0.7) return '#f56565';
    if (probability > 0.4) return '#ed8936';
    return '#48bb78';
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        AI-Powered Fraud Detection
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology color="primary" />
                ML Model Predictions
              </Typography>
              
              <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                {transactions.slice(0, 10).map((transaction, index) => (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        cursor: 'pointer',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                      }}
                      onClick={() => runMLPrediction(transaction)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          ${transaction.amount}
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
                      {mlPredictions.find(p => p.transactionId === transaction._id) && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={mlPredictions.find(p => p.transactionId === transaction._id).fraudProbability * 100}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: alpha(getRiskColor(mlPredictions.find(p => p.transactionId === transaction._id).fraudProbability), 0.2),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getRiskColor(mlPredictions.find(p => p.transactionId === transaction._id).fraudProbability),
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            Fraud Probability: {(mlPredictions.find(p => p.transactionId === transaction._id).fraudProbability * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </motion.div>
                ))}
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
                      ML Analysis Results
                    </Typography>
                    
                    {loading ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <LinearProgress />
                        <Typography sx={{ mt: 2 }}>Analyzing transaction patterns...</Typography>
                      </Box>
                    ) : mlPredictions.find(p => p.transactionId === selectedTransaction._id) && (
                      <>
                        <Alert
                          severity={mlPredictions.find(p => p.transactionId === selectedTransaction._id).isFraudulent ? 'error' : 'success'}
                          sx={{ mb: 3 }}
                        >
                          {mlPredictions.find(p => p.transactionId === selectedTransaction._id).isFraudulent
                            ? '⚠️ High probability of fraudulent activity detected!'
                            : '✓ Transaction appears legitimate'}
                        </Alert>

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Confidence Score
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={mlPredictions.find(p => p.transactionId === selectedTransaction._id).confidence * 100}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="body2">
                              {(mlPredictions.find(p => p.transactionId === selectedTransaction._id).confidence * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>

                        <Typography variant="subtitle2" sx={{ mb: 2 }}>
                          Feature Analysis
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Card variant="outlined" sx={{ p: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">Amount Anomaly</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {selectedTransaction.amount > 1000 ? 'High' : 'Normal'}
                              </Typography>
                            </Card>
                          </Grid>
                          <Grid item xs={6}>
                            <Card variant="outlined" sx={{ p: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">Time Pattern</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {new Date(selectedTransaction.timestamp).getHours() < 6 ? 'Unusual' : 'Normal'}
                              </Typography>
                            </Card>
                          </Grid>
                          <Grid item xs={6}>
                            <Card variant="outlined" sx={{ p: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">Location Risk</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {selectedTransaction.location?.country === 'Unknown' ? 'High' : 'Low'}
                              </Typography>
                            </Card>
                          </Grid>
                          <Grid item xs={6}>
                            <Card variant="outlined" sx={{ p: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">Pattern Match</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {Math.random() > 0.5 ? 'Suspicious' : 'Normal'}
                              </Typography>
                            </Card>
                          </Grid>
                        </Grid>

                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ mt: 3 }}
                          onClick={() => runMLPrediction(selectedTransaction)}
                        >
                          Re-run Analysis
                        </Button>
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
                <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Select a transaction to run AI-powered fraud detection
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIDetection;