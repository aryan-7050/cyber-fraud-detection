// components/FraudHeatmap.jsx - Completely Fixed Version
import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Select, MenuItem,
  FormControl, InputLabel, useTheme, alpha, LinearProgress,
  IconButton, Tooltip, Switch, FormControlLabel, Slider,
  Chip, Avatar, Button, Dialog, DialogTitle, DialogContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Badge, Alert,
} from '@mui/material';
import {
  Public, TrendingUp, TrendingDown, Warning, Security,
  Refresh, Download, Share, Timeline, Whatshot,
  Analytics, LocationOn, MyLocation, ZoomIn, ZoomOut,
  FilterList, NotificationsActive, GpsFixed,
  History, ShowChart, BarChart, BubbleChart,
} from '@mui/icons-material';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Graticule } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json";

const FraudHeatmap = () => {
  const theme = useTheme();
  const [fraudData, setFraudData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [tooltipContent, setTooltipContent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.7);
  const [showPredictions, setShowPredictions] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [predictions, setPredictions] = useState([]);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [riskRadarData, setRiskRadarData] = useState([]);

  // Generate comprehensive fraud data with predictions
  useEffect(() => {
    const countries = [
      { country: "USA", fraudRate: 12.5, incidents: 1245, growth: 8.2, coordinates: [-100, 40], trend: 'up', predictedRate: 14.2, confidence: 89 },
      { country: "UK", fraudRate: 8.2, incidents: 892, growth: 3.5, coordinates: [-3, 54], trend: 'up', predictedRate: 8.9, confidence: 92 },
      { country: "India", fraudRate: 15.3, incidents: 2156, growth: 12.8, coordinates: [78, 22], trend: 'up', predictedRate: 18.5, confidence: 85 },
      { country: "China", fraudRate: 6.8, incidents: 2341, growth: -2.1, coordinates: [104, 35], trend: 'down', predictedRate: 6.2, confidence: 88 },
      { country: "Brazil", fraudRate: 18.2, incidents: 782, growth: 15.4, coordinates: [-51, -14], trend: 'up', predictedRate: 22.1, confidence: 82 },
      { country: "Germany", fraudRate: 5.4, incidents: 456, growth: 1.2, coordinates: [10, 51], trend: 'up', predictedRate: 5.6, confidence: 94 },
      { country: "France", fraudRate: 7.1, incidents: 523, growth: 4.3, coordinates: [2, 47], trend: 'up', predictedRate: 7.8, confidence: 90 },
      { country: "Australia", fraudRate: 4.8, incidents: 234, growth: -0.5, coordinates: [133, -25], trend: 'down', predictedRate: 4.7, confidence: 93 },
      { country: "Japan", fraudRate: 3.2, incidents: 178, growth: -1.8, coordinates: [138, 36], trend: 'down', predictedRate: 3.0, confidence: 95 },
      { country: "South Africa", fraudRate: 22.4, incidents: 567, growth: 18.2, coordinates: [22, -30], trend: 'up', predictedRate: 27.5, confidence: 78 },
      { country: "Canada", fraudRate: 6.2, incidents: 345, growth: 2.8, coordinates: [-95, 55], trend: 'up', predictedRate: 6.8, confidence: 91 },
      { country: "Mexico", fraudRate: 16.8, incidents: 678, growth: 11.3, coordinates: [-102, 23], trend: 'up', predictedRate: 19.2, confidence: 84 },
      { country: "Russia", fraudRate: 9.4, incidents: 892, growth: 5.6, coordinates: [100, 60], trend: 'up', predictedRate: 10.5, confidence: 87 },
      { country: "UAE", fraudRate: 11.2, incidents: 234, growth: 9.8, coordinates: [54, 24], trend: 'up', predictedRate: 13.1, confidence: 86 },
      { country: "Singapore", fraudRate: 3.8, incidents: 145, growth: -0.2, coordinates: [103, 1.3], trend: 'down', predictedRate: 3.7, confidence: 96 },
    ];
    
    setFraudData(countries);
    
    // Generate time series data for selected country
    generateTimeSeriesData("India");
    
    // Generate radar data for risk factors
    setRiskRadarData([
      { subject: 'Transaction Volume', India: 85, Global: 65, fullMark: 100 },
      { subject: 'Fraud Rate', India: 75, Global: 50, fullMark: 100 },
      { subject: 'Detection Rate', India: 88, Global: 92, fullMark: 100 },
      { subject: 'Response Time', India: 70, Global: 85, fullMark: 100 },
      { subject: 'User Reports', India: 65, Global: 45, fullMark: 100 },
      { subject: 'ML Accuracy', India: 91, Global: 94, fullMark: 100 },
    ]);
    
    // Generate AI predictions
    generatePredictions(countries);
  }, []);

  const generateTimeSeriesData = (country) => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        time: `${i}:00`,
        fraudRate: Math.random() * 30 + 5,
        transactions: Math.random() * 100 + 20,
        riskScore: Math.random() * 100,
      });
    }
    setTimeSeriesData(data);
  };

  const generatePredictions = (countries) => {
    const preds = countries.map(country => ({
      country: country.country,
      predictedFraudRate: (country.fraudRate * (1 + country.growth / 100)).toFixed(1),
      confidence: Math.floor(Math.random() * 20 + 75),
      trend: country.trend,
      riskLevel: country.fraudRate > 15 ? 'Critical' : country.fraudRate > 10 ? 'High' : country.fraudRate > 5 ? 'Medium' : 'Low',
    }));
    setPredictions(preds);
  };

  const colorScale = scaleLinear()
    .domain([0, 10, 20, 30])
    .range(['#48bb78', '#ed8936', '#f56565', '#9b2c2c']);

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    generateTimeSeriesData(country.country);
    setAlertDialogOpen(true);
  };

  const getRiskAlerts = () => {
    const highRiskCountries = fraudData.filter(c => c.fraudRate > 15);
    return highRiskCountries.map(c => ({
      country: c.country,
      message: `⚠️ High fraud activity detected in ${c.country} (${c.fraudRate}% rate)`,
      severity: c.fraudRate > 20 ? 'critical' : 'high',
      timestamp: new Date().toISOString(),
    }));
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header with AI Insights */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            🌍 AI-Powered Global Fraud Intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time fraud heatmap with predictive analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip 
            icon={<Whatshot />} 
            label="Live Tracking" 
            color="error" 
            variant="outlined"
          />
          <Tooltip title="Export Report">
            <IconButton><Download /></IconButton>
          </Tooltip>
          <Tooltip title="Share Insights">
            <IconButton><Share /></IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => window.location.reload()}><Refresh /></IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* AI Prediction Banner */}
      {showPredictions && (
        <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${alpha('#667eea', 0.15)}, ${alpha('#764ba2', 0.15)})` }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BubbleChart sx={{ fontSize: 40, color: '#667eea' }} />
                <Box>
                  <Typography variant="h6" fontWeight={700}>AI Risk Forecast</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Based on ensemble ML models and historical patterns
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={<Switch checked={showPredictions} onChange={(e) => setShowPredictions(e.target.checked)} />}
                label="Show Predictions"
              />
            </Box>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {predictions.slice(0, 4).map((pred, idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="body2" color="text.secondary">{pred.country}</Typography>
                    <Typography variant="h6" fontWeight={700} color={pred.trend === 'up' ? '#f56565' : '#48bb78'}>
                      {pred.predictedFraudRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confidence: {pred.confidence}%
                    </Typography>
                    <Chip 
                      size="small" 
                      label={pred.riskLevel} 
                      color={pred.riskLevel === 'Critical' ? 'error' : pred.riskLevel === 'High' ? 'warning' : 'success'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Main Map */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Global Fraud Heatmap
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Zoom In">
                    <IconButton size="small" onClick={() => setZoomLevel(z => Math.min(z * 1.2, 3))}>
                      <ZoomIn />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom Out">
                    <IconButton size="small" onClick={() => setZoomLevel(z => Math.max(z * 0.8, 0.5))}>
                      <ZoomOut />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset View">
                    <IconButton size="small" onClick={() => { setZoomLevel(1); setPosition({ coordinates: [0, 0], zoom: 1 }); }}>
                      <GpsFixed />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ height: 500, width: '100%', position: 'relative' }}>
                <ComposableMap 
                  projectionConfig={{ scale: 147 * zoomLevel }}
                  width={800}
                  height={450}
                >
                  <ZoomableGroup center={position.coordinates} zoom={position.zoom}>
                    <Graticule stroke={alpha(theme.palette.text.primary, 0.1)} />
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const countryData = fraudData.find(
                            d => d.country === geo.properties.name
                          );
                          const fillColor = countryData 
                            ? (showPredictions && countryData.predictedRate 
                                ? colorScale(countryData.predictedRate)
                                : colorScale(countryData.fraudRate))
                            : '#D6D6DA';
                          
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              onMouseEnter={() => {
                                if (countryData) {
                                  setTooltipContent(
                                    `${countryData.country}: ${countryData.fraudRate}% fraud rate | Predicted: ${countryData.predictedRate || countryData.fraudRate}%`
                                  );
                                }
                              }}
                              onMouseLeave={() => setTooltipContent('')}
                              onClick={() => countryData && handleCountryClick(countryData)}
                              style={{
                                default: {
                                  fill: fillColor,
                                  stroke: theme.palette.divider,
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                  transition: 'all 0.3s',
                                },
                                hover: {
                                  fill: '#667eea',
                                  stroke: theme.palette.divider,
                                  strokeWidth: 1,
                                  outline: 'none',
                                  cursor: 'pointer',
                                },
                                pressed: {
                                  fill: '#764ba2',
                                  outline: 'none',
                                },
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                    
                    {/* Animated Markers for high-risk areas */}
                    {fraudData.filter(c => c.fraudRate > 15).map(({ coordinates, country, fraudRate }) => (
                      <Marker key={country} coordinates={coordinates}>
                        <circle 
                          r={Math.sqrt(fraudRate) * (showPredictions ? 4 : 3)} 
                          fill="#f56565" 
                          fillOpacity={0.6}
                        >
                          <animate 
                            attributeName="r" 
                            values={`${Math.sqrt(fraudRate) * 2};${Math.sqrt(fraudRate) * 5};${Math.sqrt(fraudRate) * 2}`} 
                            dur={`${2 / animationSpeed}s`} 
                            repeatCount="indefinite" 
                          />
                          <animate 
                            attributeName="opacity" 
                            values="0.9;0.3;0.9" 
                            dur={`${2 / animationSpeed}s`} 
                            repeatCount="indefinite" 
                          />
                        </circle>
                      </Marker>
                    ))}
                  </ZoomableGroup>
                </ComposableMap>
              </Box>
              
              {tooltipContent && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                  <Typography variant="body2">
                    <Security sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    {tooltipContent}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Analytics & Alerts */}
        <Grid item xs={12} lg={4}>
          {/* Real-time Alerts */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  <NotificationsActive sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Live Intelligence Alerts
                </Typography>
                <Chip label="Real-time" size="small" color="error" />
              </Box>
              
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {getRiskAlerts().map((alert, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Box sx={{ 
                      p: 1.5, 
                      mb: 1, 
                      borderRadius: 2,
                      bgcolor: alpha(alert.severity === 'critical' ? '#f56565' : '#ed8936', 0.1),
                      borderLeft: `3px solid ${alert.severity === 'critical' ? '#f56565' : '#ed8936'}`,
                    }}>
                      <Typography variant="body2">{alert.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Time Series Chart */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                {selectedCountry ? `${selectedCountry.country} - Hourly Risk` : '24-Hour Risk Pattern'}
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                    <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="fraudRate" stroke="#f56565" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="riskScore" stroke="#ed8936" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Risk Radar Chart */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                Risk Factor Analysis
              </Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={riskRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Current Risk" dataKey="India" stroke="#f56565" fill="#f56565" fillOpacity={0.3} />
                    <Radar name="Global Average" dataKey="Global" stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
                    <RechartsTooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                Visualization Controls
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption">Animation Speed</Typography>
                <Slider
                  value={animationSpeed}
                  onChange={(e, v) => setAnimationSpeed(v)}
                  min={0.5}
                  max={2}
                  step={0.1}
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <FormControlLabel
                control={<Switch checked={showPredictions} onChange={(e) => setShowPredictions(e.target.checked)} />}
                label="Enable AI Predictions"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Country Details Dialog */}
      <Dialog 
        open={alertDialogOpen} 
        onClose={() => setAlertDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedCountry?.country} - Fraud Intelligence Report
            </Typography>
            <IconButton onClick={() => setAlertDialogOpen(false)}>
              <Security />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCountry && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: alpha('#667eea', 0.1) }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Current Fraud Rate</Typography>
                    <Typography variant="h4" fontWeight={700} color={selectedCountry.fraudRate > 15 ? '#f56565' : '#48bb78'}>
                      {selectedCountry.fraudRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ bgcolor: alpha('#ed8936', 0.1) }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">AI Prediction (Next Quarter)</Typography>
                    <Typography variant="h4" fontWeight={700} color={selectedCountry.trend === 'up' ? '#f56565' : '#48bb78'}>
                      {selectedCountry.predictedRate}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Total Incidents</Typography>
                    <Typography variant="h5" fontWeight={700}>{selectedCountry.incidents}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">YoY Growth</Typography>
                    <Typography variant="h5" fontWeight={700} color={selectedCountry.growth > 0 ? '#f56565' : '#48bb78'}>
                      {selectedCountry.growth > 0 ? '+' : ''}{selectedCountry.growth}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Alert severity={selectedCountry.fraudRate > 15 ? 'error' : 'warning'}>
                  {selectedCountry.fraudRate > 15 
                    ? `⚠️ CRITICAL: ${selectedCountry.country} is experiencing high fraud activity. Immediate review recommended.`
                    : `ℹ️ ${selectedCountry.country} has moderate fraud levels. Continue monitoring.`}
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FraudHeatmap;