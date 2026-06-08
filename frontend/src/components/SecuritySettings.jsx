import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  TextField,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Security,
  Fingerprint,
  Email,
  Phone,
  Lock,
  Devices,
  Notifications,
  History,
  CheckCircle,
  ErrorOutline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';

const SecuritySettings = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    biometricLogin: false,
    emailAlerts: true,
    smsAlerts: false,
    loginNotifications: true,
    deviceManagement: true,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Dark Web Password Check states
  const [passwordToCheck, setPasswordToCheck] = useState('');
  const [passwordCheckResult, setPasswordCheckResult] = useState(null);
  const [checkingPassword, setCheckingPassword] = useState(false);

  const handleToggle = (setting) => {
    setSettings({ ...settings, [setting]: !settings[setting] });
    toast.success(`${setting} updated successfully`);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const checkPasswordBreach = async (password) => {
    if (!password) return;
    setCheckingPassword(true);
    try {
      const sha1 = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
      const prefix = sha1.slice(0, 5);
      const suffix = sha1.slice(5);
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();
      const found = text.split('\n').some(line => line.split(':')[0] === suffix);
      setPasswordCheckResult({
        isBreached: found,
        message: found 
          ? '⚠️ This password has appeared in known data breaches. Please choose a stronger password.' 
          : '✓ Password not found in any known breaches. Good!'
      });
    } catch (err) {
      setPasswordCheckResult({ isBreached: false, message: 'Unable to check. Try again later.' });
    } finally {
      setCheckingPassword(false);
    }
  };

  const securitySettings = [
    {
      icon: <Fingerprint />,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      key: 'twoFactorAuth',
    },
    {
      icon: <Fingerprint />,
      title: 'Biometric Login',
      description: 'Use fingerprint or face recognition to login',
      key: 'biometricLogin',
    },
    {
      icon: <Email />,
      title: 'Email Alerts',
      description: 'Receive security alerts via email',
      key: 'emailAlerts',
    },
    {
      icon: <Phone />,
      title: 'SMS Alerts',
      description: 'Receive security alerts via SMS',
      key: 'smsAlerts',
    },
    {
      icon: <Notifications />,
      title: 'Login Notifications',
      description: 'Get notified when someone logs into your account',
      key: 'loginNotifications',
    },
    {
      icon: <Devices />,
      title: 'Device Management',
      description: 'Manage devices that have access to your account',
      key: 'deviceManagement',
    },
  ];

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Security Settings
      </Typography>

      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Password Change */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock color="primary" />
                Change Password
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handlePasswordChange}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                Update Password
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="primary" />
                Security Preferences
              </Typography>
              <List>
                {securitySettings.map((setting, index) => (
                  <React.Fragment key={setting.key}>
                    <ListItem>
                      <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                        {setting.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={setting.title}
                        secondary={setting.description}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={settings[setting.key]}
                          onChange={() => handleToggle(setting.key)}
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < securitySettings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dark Web Password Check */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security color="primary" />
                Dark Web Password Check
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Check if your password has been leaked in any data breaches (powered by HaveIBeenPwned).
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="Enter password to check"
                value={passwordToCheck}
                onChange={(e) => setPasswordToCheck(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button 
                variant="outlined" 
                onClick={() => checkPasswordBreach(passwordToCheck)}
                disabled={!passwordToCheck || checkingPassword}
                startIcon={checkingPassword ? <CircularProgress size={16} /> : <Security />}
              >
                Check Password
              </Button>
              {passwordCheckResult && (
                <Alert 
                  severity={passwordCheckResult.isBreached ? 'error' : 'success'} 
                  sx={{ mt: 2 }}
                  icon={passwordCheckResult.isBreached ? <ErrorOutline /> : <CheckCircle />}
                >
                  {passwordCheckResult.message}
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <History color="primary" />
                Active Sessions
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Devices />
                  </ListItemIcon>
                  <ListItemText
                    primary="Chrome on Windows"
                    secondary="Last active: 2 minutes ago | Current session"
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" color="primary">
                      Current
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Devices />
                  </ListItemIcon>
                  <ListItemText
                    primary="Safari on iPhone"
                    secondary="Last active: 2 days ago"
                  />
                  <ListItemSecondaryAction>
                    <Button size="small" color="error">
                      Revoke
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              <Button variant="outlined" color="error" fullWidth sx={{ mt: 2 }}>
                Logout from All Devices
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Alert */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            For enhanced security, we recommend enabling Two-Factor Authentication and reviewing your active sessions regularly.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default SecuritySettings;