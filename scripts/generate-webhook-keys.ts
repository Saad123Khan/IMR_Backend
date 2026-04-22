#!/usr/bin/env node

/**
 * Generate RSA key pair for webhook encryption
 * Run: npx ts-node scripts/generate-webhook-keys.ts
 * 
 * Output: Displays keys for .env configuration
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

function generateKeys() {
  console.log('🔐 Generating RSA-2048 Key Pair for Webhook Encryption...\n');

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  const pubKeyStr = publicKey.toString();
  const privKeyStr = privateKey.toString();

  console.log('✅ Key pair generated successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📋 Add these to your .env file:\n');

  // Escape newlines for env format
  const pubKeyEnv = pubKeyStr.replace(/\n/g, '\\n');
  const privKeyEnv = privKeyStr.replace(/\n/g, '\\n');

  console.log(`WEBHOOK_PUBLIC_KEY="${pubKeyEnv}"\n`);
  console.log(`WEBHOOK_PRIVATE_KEY="${privKeyEnv}"\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🚀 Next steps:\n');
  console.log(
    '1. Copy the WEBHOOK_PUBLIC_KEY and share with admin backend team',
  );
  console.log('2. Copy both keys to your .env file (keep private key secure)');
  console.log(
    '3. Restart the backend: npm run start:debug or docker-compose up -d\n',
  );

  console.log('📚 Setup guide: See WEBHOOK_SETUP.md for full instructions\n');

  // Optionally save to .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    const envContent = `# Webhook Encryption Keys
WEBHOOK_PUBLIC_KEY="${pubKeyEnv}"
WEBHOOK_PRIVATE_KEY="${privKeyEnv}"
`;
    try {
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Keys saved to ${envPath}\n`);
      console.log('⚠️  Keep this file secure and never commit to version control!\n');
    } catch (error) {
      console.error(`❌ Failed to write to ${envPath}:`, error);
    }
  } else {
    console.log(`⚠️  ${envPath} already exists. Manually add the keys above.\n`);
  }
}

generateKeys();
