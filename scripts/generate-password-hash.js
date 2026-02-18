/**
 * Password Hash Generator
 * Run this script to generate bcrypt hashes for user passwords
 * 
 * Usage: node scripts/generate-password-hash.js your_password
 */

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = process.argv[2];
  
  if (!password) {
    console.error('❌ Error: Please provide a password');
    console.log('\nUsage: node scripts/generate-password-hash.js <password>');
    console.log('Example: node scripts/generate-password-hash.js MySecurePassword123');
    process.exit(1);
  }

  if (password.length < 8) {
    console.warn('⚠️  Warning: Password should be at least 8 characters long');
  }

  console.log('\n🔒 Generating password hash...\n');
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n✅ Copy the hash above and use it in your database INSERT/UPDATE statements\n');
}

generateHash().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
