const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
    console.log('🔍 Testing MongoDB Atlas connection...');
    console.log('📡 Connection string:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ SUCCESS! Connected to MongoDB Atlas');
        console.log('📁 Database:', mongoose.connection.name);
        console.log('🔗 Host:', mongoose.connection.host);
        
        // Create a test collection to verify write permissions
        const testSchema = new mongoose.Schema({ test: String, timestamp: Date });
        const Test = mongoose.model('Test', testSchema);
        await Test.create({ test: 'connection_test', timestamp: new Date() });
        console.log('✅ Successfully wrote to database');
        
        await mongoose.disconnect();
        console.log('✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Check if username/password is correct');
        console.log('2. Check if IP address is whitelisted in MongoDB Atlas');
        console.log('3. Go to MongoDB Atlas → Network Access → Add IP Address 0.0.0.0/0');
    }
};

testConnection();