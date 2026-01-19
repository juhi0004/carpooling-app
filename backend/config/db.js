const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('\n📝 ===================================');
    console.log('🔗 Connecting to MongoDB...');
    console.log(`📍 URI: ${process.env.MONGODB_URI}`);
    console.log('📝 ===================================\n');

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ MongoDB Connected Successfully!\n');
    return true;
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   • Windows: Make sure MongoDB service is running');
    console.log('   • Mac: Run: brew services start mongodb-community');
    console.log('   • Linux: Run: sudo systemctl start mongod');
    console.log('   • Or use: mongosh (to test connection)\n');
    return false;
  }
};

module.exports = connectDB;
