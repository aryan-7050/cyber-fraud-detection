// components/BehavioralTracker.jsx
import React, { useEffect, useRef, useContext, useCallback } from 'react';
import { NotificationContext } from '../App';

const BehavioralTracker = ({ children, onBehaviorScore, threshold = 70 }) => {
  const { addNotification } = useContext(NotificationContext);
  const startTime = useRef(Date.now());
  const keyPresses = useRef([]);
  const mouseMovements = useRef([]);
  const lastKeyTime = useRef(null);
  const interactionCount = useRef(0);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      const now = Date.now();
      if (lastKeyTime.current) {
        const interval = now - lastKeyTime.current;
        keyPresses.current.push(interval);
      }
      lastKeyTime.current = now;
      interactionCount.current++;
    };
    
    const handleMouseMove = (e) => {
      mouseMovements.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
      if (mouseMovements.current.length > 50) mouseMovements.current.shift();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const analyzeBehavior = useCallback(() => {
    const duration = (Date.now() - startTime.current) / 1000;
    const avgTypingSpeed = keyPresses.current.length > 0 
      ? keyPresses.current.reduce((a,b) => a+b,0) / keyPresses.current.length 
      : 0;
    
    let anomalyScore = 0;
    if (avgTypingSpeed < 50 && keyPresses.current.length > 3) anomalyScore += 30;
    if (avgTypingSpeed > 500 && keyPresses.current.length > 5) anomalyScore += 20;
    if (mouseMovements.current.length === 0 && keyPresses.current.length > 10) anomalyScore += 25;
    if (interactionCount.current > 100 && duration < 10) anomalyScore += 25;
    
    if (anomalyScore > threshold && addNotification) {
      addNotification({
        id: Date.now(),
        message: `⚠️ Behavioral anomaly detected: ${anomalyScore}% suspicious`,
        type: 'warning'
      });
    }
    
    if (onBehaviorScore) onBehaviorScore(anomalyScore);
    return anomalyScore;
  }, [addNotification, onBehaviorScore, threshold]);
  
  useEffect(() => {
    const handleBeforeSubmit = () => analyzeBehavior();
    window.addEventListener('beforeunload', handleBeforeSubmit);
    return () => window.removeEventListener('beforeunload', handleBeforeSubmit);
  }, [analyzeBehavior]);
  
  return <>{children}</>;
};

export default BehavioralTracker;