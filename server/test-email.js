require("dotenv").config();
const { testEmail } = require("./services/emailService");

console.log("Environment Check:");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✓ Set (length: " + process.env.EMAIL_PASS.length + ")" : "✗ Missing");
console.log("\n");

testEmail().then(success => {
    if (success) {
        console.log("\n✅ Email test passed!");
    } else {
        console.log("\n❌ Email test failed!");
        console.log("\nTroubleshooting tips:");
        console.log("1. Check your Gmail App Password (16 characters, no spaces)");
        console.log("2. Enable 2FA on your Google account");
        console.log("3. Make sure .env file has correct values");
        console.log("4. Run: npm install nodemailer");
    }
});