/**
 * Environment Validation
 * Ensures all required environment variables are set
 */

const requiredEnvVars = [
  "PORT",
  "NODE_ENV",
  "MONGODB_URI",
  "JWT_SECRET",
  "POLYGON_RPC_URL",
  "NETWORK_CHAIN_ID",
];

const validateEnvironment = () => {
  console.log("\n📝 ===================================");
  console.log("✅ Validating Environment Variables");
  console.log("📝 ===================================\n");

  const missing = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
      console.error(`❌ Missing: ${envVar}`);
    } else {
      console.log(`✅ ${envVar}: ${process.env[envVar]}`);
    }
  }

  if (missing.length > 0) {
    console.error(`\n❌ Missing environment variables: ${missing.join(", ")}`);
    console.error("💡 Check your .env file\n");
    process.exit(1);
  }

  console.log("\n✅ All environment variables are set!\n");
};

module.exports = validateEnvironment;
