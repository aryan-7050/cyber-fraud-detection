import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  useTheme,
  alpha,
  Fade,
  Grow,
  Slide,
} from '@mui/material';
import {
  AttachMoney,
  Person,
  AccountBalance,
  LocationOn,
  Public,
  Computer,
  Send,
  Cancel,
  Warning,
  Security,
  TrendingUp,
  Speed,
  CheckCircle,
  ArrowForward,
  ArrowBack,
  Fingerprint,
  VerifiedUser,
  GpsFixed,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { transactionService } from '../services/api';
import { toast } from 'react-toastify';

const TransactionForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fraudScore, setFraudScore] = useState(0);
  const [showFraudWarning, setShowFraudWarning] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'transfer',
    recipient: {
      name: '',
      accountNumber: '',
      bankName: '',
    },
    location: {
      city: '',
      country: '',
      ipAddress: '',
    },
  });

  const steps = ['Transaction Details', 'Recipient Info', 'Location & Review'];

  // Real-time fraud score calculation
  useEffect(() => {
    calculateFraudScore();
  }, [formData.amount, formData.recipient.accountNumber, formData.location.city]);

  const calculateFraudScore = () => {
    let score = 0;
    
    // Amount-based scoring
    const amount = parseFloat(formData.amount);
    if (amount > 10000) score += 40;
    else if (amount > 5000) score += 25;
    else if (amount > 1000) score += 10;
    
    // New recipient scoring
    if (formData.recipient.accountNumber && formData.recipient.accountNumber.length > 0) {
      score += 15;
    }
    
    // Location-based scoring
    if (formData.location.country && formData.location.country !== 'USA') {
      score += 20;
    }
    
    setFraudScore(Math.min(score, 100));
    setShowFraudWarning(score > 50);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        toast.error('Please enter a valid amount');
        return false;
      }
      if (parseFloat(formData.amount) > 50000) {
        toast.error('Amount exceeds maximum limit of $50,000');
        return false;
      }
      return true;
    }
    
    if (activeStep === 1) {
      if (!formData.recipient.name.trim()) {
        toast.error('Please enter recipient name');
        return false;
      }
      if (!formData.recipient.accountNumber.trim()) {
        toast.error('Please enter account number');
        return false;
      }
      return true;
    }
    
    if (activeStep === 2) {
      if (!formData.location.city.trim()) {
        toast.error('Please enter city');
        return false;
      }
      if (!formData.location.country.trim()) {
        toast.error('Please enter country');
        return false;
      }
      return true;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    
    try {
      const response = await transactionService.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        location: {
          ...formData.location,
          ipAddress: formData.location.ipAddress || '192.168.1.1',
        },
      });
      
      if (response.fraudAlert) {
        toast.error(
          <div>
            <strong>⚠️ FRAUD ALERT DETECTED!</strong>
            <br />
            Risk Level: {response.fraudAlert.riskLevel.toUpperCase()}
            <br />
            Score: {response.fraudAlert.score}
            <br />
            Reasons: {response.fraudAlert.reasons.join(', ')}
          </div>,
          {
            duration: 8000,
            icon: '⚠️',
          }
        );
      } else {
        toast.success(
          <div>
            <strong>✓ Transaction Completed!</strong>
            <br />
            Amount: ${formData.amount}
            <br />
            Recipient: {formData.recipient.name}
          </div>,
          {
            duration: 5000,
          }
        );
      }
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={true}>
            <Box>
              <TextField
                fullWidth
                label="Transaction Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder="0.00"
                sx={{ mb: 3 }}
                helperText="Enter the amount to transfer (max $50,000)"
              />
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Transaction Type"
                >
                  <MenuItem value="transfer">💸 Transfer</MenuItem>
                  <MenuItem value="debit">💳 Debit</MenuItem>
                  <MenuItem value="credit">💎 Credit</MenuItem>
                </Select>
              </FormControl>
              
              {parseFloat(formData.amount) > 5000 && (
                <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
                  Large transaction amount detected. Additional verification may be required.
                </Alert>
              )}
            </Box>
          </Fade>
        );
      
      case 1:
        return (
          <Fade in={true}>
            <Box>
              <TextField
                fullWidth
                label="Recipient Name"
                name="recipient.name"
                value={formData.recipient.name}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder=""
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Account Number"
                name="recipient.accountNumber"
                value={formData.recipient.accountNumber}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalance color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder=""
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Bank Name"
                name="recipient.bankName"
                value={formData.recipient.bankName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalance color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder=""
                sx={{ mb: 3 }}
              />
            </Box>
          </Fade>
        );
      
      case 2:
        return (
          <Fade in={true}>
            <Box>
              <TextField
                fullWidth
                label="City"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder=""
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Country"
                name="location.country"
                value={formData.location.country}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Public color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder=""
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="IP Address"
                name="location.ipAddress"
                value={formData.location.ipAddress}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Computer color="primary" />
                    </InputAdornment>
                  ),
                }}
                placeholder=""
                helperText="Auto-detected if left blank"
              />
            </Box>
          </Fade>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}${Math.floor(Math.random() * 50 + 10).toString(16)}, ${theme.palette.secondary.main}${Math.floor(Math.random() * 50 + 10).toString(16)})`,
              borderRadius: '50%',
              width: Math.random() * 150 + 50,
              height: Math.random() * 150 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(50px)',
              opacity: 0.1,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </Box>

      <Grow in={true} timeout={500}>
        <Card
          sx={{
            maxWidth: 700,
            width: '100%',
            mx: 2,
            backdropFilter: 'blur(10px)',
            background: alpha(theme.palette.background.paper, 0.95),
            borderRadius: 4,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            zIndex: 1,
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Security sx={{ fontSize: 50, color: theme.palette.primary.main, mb: 2 }} />
              </motion.div>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                New Transaction
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Securely transfer funds with AI-powered fraud detection
              </Typography>
            </Box>

            {/* Fraud Score Indicator */}
            {fraudScore > 0 && (
              <Slide direction="down" in={true}>
                <Paper
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: alpha(
                      fraudScore > 70 ? '#f56565' : fraudScore > 40 ? '#ed8936' : '#48bb78',
                      0.1
                    ),
                    border: `1px solid ${alpha(
                      fraudScore > 70 ? '#f56565' : fraudScore > 40 ? '#ed8936' : '#48bb78',
                      0.3
                    )}`,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Speed fontSize="small" />
                      Risk Assessment Score
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: fraudScore > 70 ? '#f56565' : fraudScore > 40 ? '#ed8936' : '#48bb78',
                      }}
                    >
                      {fraudScore}%
                    </Typography>
                  </Box>
                  <Slider
                    value={fraudScore}
                    disabled
                    sx={{
                      color: fraudScore > 70 ? '#f56565' : fraudScore > 40 ? '#ed8936' : '#48bb78',
                      '& .MuiSlider-track': {
                        backgroundColor: fraudScore > 70 ? '#f56565' : fraudScore > 40 ? '#ed8936' : '#48bb78',
                      },
                    }}
                  />
                  {showFraudWarning && (
                    <Alert severity="warning" sx={{ mt: 2 }} icon={<Warning />}>
                      This transaction has been flagged for review. Please verify all details carefully.
                    </Alert>
                  )}
                </Paper>
              </Slide>
            )}

            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Form Content */}
            <form onSubmit={(e) => e.preventDefault()}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {getStepContent(activeStep)}
                </motion.div>
              </AnimatePresence>

              {/* Transaction Summary (Review Step) */}
              {activeStep === 2 && (
                <Paper
                  sx={{
                    p: 2,
                    mt: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Transaction Summary
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Amount:</Typography>
                      <Typography variant="body2" fontWeight={600}>${formData.amount}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Type:</Typography>
                      <Typography variant="body2" textTransform="capitalize">{formData.type}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Recipient:</Typography>
                      <Typography variant="body2">{formData.recipient.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Account:</Typography>
                      <Typography variant="body2">****{formData.recipient.accountNumber?.slice(-4)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Location:</Typography>
                      <Typography variant="body2">{formData.location.city}, {formData.location.country}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBack />}
                    sx={{ flex: 1 }}
                  >
                    Back
                  </Button>
                )}
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                    sx={{
                      flex: 1,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                    sx={{
                      flex: 1,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    {loading ? 'Processing...' : 'Submit Transaction'}
                  </Button>
                )}
              </Box>
            </form>

            {/* Security Note */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <VerifiedUser sx={{ fontSize: 14 }} />
                Secure transaction with end-to-end encryption
              </Typography>
            </Box>

            {/* Cancel Button */}
            <Button
              variant="text"
              onClick={() => navigate('/dashboard')}
              startIcon={<Cancel />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Cancel Transaction
            </Button>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
};

export default TransactionForm;
