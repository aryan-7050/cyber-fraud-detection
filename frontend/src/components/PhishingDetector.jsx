// components/PhishingDetector.jsx - Fixed
import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, Button, 
  CircularProgress, Alert, Chip, LinearProgress, useTheme, 
  alpha, Paper, Grid
} from '@mui/material';
import { 
  LinkOff, Security, Warning, CheckCircle, 
  ContentCopy, History 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const PhishingDetector = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  
  const analyzeUrl = (urlStr) => {
    try {
      let normalized = urlStr.trim();
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = 'https://' + normalized;
      }
      const urlObj = new URL(normalized);
      const hostname = urlObj.hostname;
      const path = urlObj.pathname;
      
      let score = 0;
      const reasons = [];
      
      const suspiciousWords = ['login', 'verify', 'secure', 'account', 'update', 'confirm', 'bank', 'paypal', 'amazon', 'apple', 'signin', 'auth'];
      const foundKeywords = suspiciousWords.filter(word => path.toLowerCase().includes(word));
      if (foundKeywords.length > 0) {
        score += Math.min(20 + foundKeywords.length * 5, 35);
        reasons.push(`Suspicious keyword${foundKeywords.length > 1 ? 's' : ''}: ${foundKeywords.join(', ')}`);
      }
      
      if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        score += 40;
        reasons.push('IP address used instead of domain name');
      }
      
      if (hostname.split('.').length > 4) {
        score += 15;
        reasons.push('Unusual number of subdomains');
      }
      
      if (normalized.length > 100) {
        score += 10;
        reasons.push('Excessively long URL');
      }
      
      if (urlObj.protocol !== 'https:') {
        score += 30;
        reasons.push('Missing HTTPS encryption');
      }
      
      if (normalized.includes('@')) {
        score += 45;
        reasons.push('@ symbol in URL – common phishing technique');
      }
      
      const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.top', '.xyz', '.club', '.work'];
      if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
        score += 20;
        reasons.push('Suspicious top-level domain');
      }
      
      const popularDomains = ['google', 'facebook', 'amazon', 'microsoft', 'apple', 'paypal', 'netflix', 'instagram'];
      for (const domain of popularDomains) {
        if (hostname.includes(domain) && !hostname.endsWith(`.${domain}.com`) && !hostname.endsWith(`.${domain}.org`)) {
          score += 35;
          reasons.push(`Possible impersonation of ${domain}.com`);
          break;
        }
      }
      
      const riskLevel = score > 70 ? 'dangerous' : score > 40 ? 'suspicious' : 'safe';
      return { score, riskLevel, reasons, url: normalized, hostname };
    } catch (e) {
      return { score: 100, riskLevel: 'dangerous', reasons: ['Invalid URL format'], url: urlStr, hostname: 'Invalid' };
    }
  };
  
  const handleCheck = () => {
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const analysis = analyzeUrl(url);
      setResult(analysis);
      setLoading(false);
      
      setHistory(prev => [{
        ...analysis,
        checkedAt: new Date().toISOString(),
        originalUrl: url
      }, ...prev].slice(0, 10));
      
      if (analysis.riskLevel !== 'safe') {
        toast.warning(`⚠️ Phishing risk detected! Score: ${analysis.score}%`);
      } else {
        toast.success('✓ URL appears safe');
      }
    }, 800);
  };
  
  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.url);
      toast.success('URL copied to clipboard');
    }
  };
  
  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
        <LinkOff sx={{ mr: 1, verticalAlign: 'middle', color: '#667eea' }} />
        URL Phishing Detector
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        AI-powered analysis of suspicious links – protects you from fake login pages and scams
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <TextField
                  fullWidth
                  label="Paste suspicious link here"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/login"
                  sx={{ flex: 1 }}
                  onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                />
                <Button 
                  variant="contained" 
                  onClick={handleCheck} 
                  disabled={loading}
                  sx={{ minWidth: 120, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Check URL'}
                </Button>
              </Box>
              
              {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Alert 
                    severity={result.riskLevel === 'dangerous' ? 'error' : result.riskLevel === 'suspicious' ? 'warning' : 'success'}
                    icon={result.riskLevel === 'dangerous' ? <Warning /> : result.riskLevel === 'suspicious' ? <Security /> : <CheckCircle />}
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {result.riskLevel === 'dangerous' ? '🚨 DANGEROUS – Phishing detected!' : 
                       result.riskLevel === 'suspicious' ? '⚠️ Suspicious – Proceed with caution' : 
                       '✓ Safe – No phishing indicators found'}
                    </Typography>
                    <Typography variant="body2">Risk Score: {result.score}%</Typography>
                    {result.hostname && <Typography variant="caption" display="block">Domain: {result.hostname}</Typography>}
                  </Alert>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={result.score} 
                    sx={{ 
                      height: 10, borderRadius: 5, mb: 3,
                      bgcolor: alpha(result.riskLevel === 'dangerous' ? '#f56565' : result.riskLevel === 'suspicious' ? '#ed8936' : '#48bb78', 0.2),
                      '& .MuiLinearProgress-bar': { bgcolor: result.riskLevel === 'dangerous' ? '#f56565' : result.riskLevel === 'suspicious' ? '#ed8936' : '#48bb78' }
                    }}
                  />
                  
                  {result.reasons.length > 0 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>🔍 Analysis details:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {result.reasons.map((reason, i) => (
                          <Chip key={i} label={reason} size="small" color="warning" variant="outlined" />
                        ))}
                      </Box>
                    </>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                    <Button size="small" startIcon={<ContentCopy />} onClick={handleCopy}>
                      Copy URL
                    </Button>
                  </Box>
                  
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>💡 Cyber Tip:</strong> Always check the URL before entering any credentials. Legitimate banking sites never ask for your password via email links.
                    </Typography>
                  </Alert>
                </motion.div>
              )}
              
              {!result && !loading && (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: alpha('#667eea', 0.05) }}>
                  <Security sx={{ fontSize: 50, color: '#667eea', mb: 1, opacity: 0.6 }} />
                  <Typography variant="body2" color="text.secondary">
                    Enter a URL above to check if it's a phishing attempt.
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <History /> Recent Checks
              </Typography>
              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                  No recent checks. Run your first URL scan.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                  {history.map((item, idx) => (
                    <Box key={idx} sx={{ 
                      p: 1.5, mb: 1, borderRadius: 2,
                      bgcolor: alpha(item.riskLevel === 'dangerous' ? '#f56565' : item.riskLevel === 'suspicious' ? '#ed8936' : '#48bb78', 0.1),
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha('#667eea', 0.1) }
                    }} onClick={() => {
                      setUrl(item.originalUrl);
                      setResult(item);
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{item.originalUrl}</Typography>
                        <Chip label={`${item.score}%`} size="small" color={item.riskLevel === 'dangerous' ? 'error' : item.riskLevel === 'suspicious' ? 'warning' : 'success'} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.checkedAt).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>📢 Common Phishing Signs</Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><Typography variant="caption">Poor spelling and grammar</Typography></li>
                <li><Typography variant="caption">Urgent language threatening account closure</Typography></li>
                <li><Typography variant="caption">Unsolicited attachments or links</Typography></li>
                <li><Typography variant="caption">Mismatched sender email address</Typography></li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PhishingDetector;