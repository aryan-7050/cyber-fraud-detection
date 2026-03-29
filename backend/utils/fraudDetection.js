class FraudDetectionEngine {
    
    // Rule 1: Amount threshold check
    static checkAmountThreshold(amount, userHistory) {
        const averageAmount = userHistory.reduce((sum, t) => sum + t.amount, 0) / (userHistory.length || 1);
        const threshold = averageAmount * 5; // 5 times average
        
        if (amount > threshold && amount > 10000) {
            return {
                flagged: true,
                reason: 'Transaction amount exceeds normal pattern',
                score: 30
            };
        }
        return { flagged: false, reason: null, score: 0 };
    }
    
    // Rule 2: Transaction frequency check
    static checkFrequency(transactions, timeWindowMinutes = 10) {
        const now = new Date();
        const windowStart = new Date(now - timeWindowMinutes * 60000);
        
        const recentTransactions = transactions.filter(t => 
            new Date(t.timestamp) > windowStart && t.status === 'completed'
        );
        
        if (recentTransactions.length >= 5) {
            return {
                flagged: true,
                reason: `High transaction frequency: ${recentTransactions.length} transactions in ${timeWindowMinutes} minutes`,
                score: 40
            };
        }
        return { flagged: false, reason: null, score: 0 };
    }
    
    // Rule 3: Location anomaly check
    static checkLocationAnomaly(currentLocation, userLocations) {
        if (!currentLocation || !currentLocation.city || userLocations.length === 0) {
            return { flagged: false, reason: null, score: 0 };
        }
        
        // Check if this is a new location
        const isNewLocation = !userLocations.some(loc => 
            loc && loc.city === currentLocation.city && loc.country === currentLocation.country
        );
        
        if (isNewLocation) {
            return {
                flagged: true,
                reason: `New location detected: ${currentLocation.city}, ${currentLocation.country || 'Unknown'}`,
                score: 35
            };
        }
        return { flagged: false, reason: null, score: 0 };
    }
    
    // Rule 4: Suspicious recipient check
    static checkRecipient(recipient, userHistory) {
        if (!recipient || !recipient.accountNumber) {
            return { flagged: false, reason: null, score: 0 };
        }
        
        const previousTransactions = userHistory.filter(t => 
            t.recipient && t.recipient.accountNumber === recipient.accountNumber
        );
        
        if (previousTransactions.length === 0 && recipient.accountNumber) {
            return {
                flagged: true,
                reason: 'First time transaction with this recipient',
                score: 15
            };
        }
        return { flagged: false, reason: null, score: 0 };
    }
    
    // Rule 5: Unusual time check
    static checkUnusualTime(timestamp) {
        const hour = new Date(timestamp).getHours();
        const isLateNight = hour < 5 || hour > 23;
        
        if (isLateNight) {
            return {
                flagged: true,
                reason: `Transaction at unusual hour: ${hour}:00`,
                score: 20
            };
        }
        return { flagged: false, reason: null, score: 0 };
    }
    
    // Main detection method
    static async analyzeTransaction(transaction, user, userTransactions) {
        const flags = [];
        let totalScore = 0;
        
        // Get user's transaction history (last 50 transactions)
        const userHistory = userTransactions.slice(0, 50);
        
        // Apply all detection rules
        const amountCheck = this.checkAmountThreshold(transaction.amount, userHistory);
        if (amountCheck.flagged) {
            flags.push(amountCheck.reason);
            totalScore += amountCheck.score;
        }
        
        const frequencyCheck = this.checkFrequency(userTransactions);
        if (frequencyCheck.flagged) {
            flags.push(frequencyCheck.reason);
            totalScore += frequencyCheck.score;
        }
        
        const locationCheck = this.checkLocationAnomaly(transaction.location, userHistory.map(t => t.location));
        if (locationCheck.flagged) {
            flags.push(locationCheck.reason);
            totalScore += locationCheck.score;
        }
        
        const recipientCheck = this.checkRecipient(transaction.recipient, userHistory);
        if (recipientCheck.flagged) {
            flags.push(recipientCheck.reason);
            totalScore += recipientCheck.score;
        }
        
        const timeCheck = this.checkUnusualTime(transaction.timestamp);
        if (timeCheck.flagged) {
            flags.push(timeCheck.reason);
            totalScore += timeCheck.score;
        }
        
        // Determine risk level based on score
        let riskLevel = 'low';
        let isFraudulent = false;
        
        if (totalScore >= 70) {
            riskLevel = 'critical';
            isFraudulent = true;
        } else if (totalScore >= 50) {
            riskLevel = 'high';
            isFraudulent = true;
        } else if (totalScore >= 30) {
            riskLevel = 'medium';
        } else if (totalScore >= 15) {
            riskLevel = 'low';
        }
        
        return {
            fraudScore: totalScore,
            riskLevel,
            isFraudulent,
            fraudReason: flags,
            shouldBlock: totalScore >= 60
        };
    }
}

module.exports = FraudDetectionEngine;