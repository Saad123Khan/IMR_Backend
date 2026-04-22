/**
 * Webhook Payload Encryption & Signing Script
 * 
 * Encrypts corridor payload and optionally signs the request.
 * 
 * Usage - Encrypt only:
 * npm run webhook:encrypt -- \
 *   --url http://localhost:3000/api/v1 \
 *   --payload '{"organizationId":"org-123","mto":"WESTERN_UNION",...}'
 * 
 * Usage - Encrypt & Sign:
 * npm run webhook:encrypt -- \
 *   --url http://localhost:3000/api/v1 \
 *   --payload '{"organizationId":"org-123","mto":"WESTERN_UNION",...}' \
 *   --admin-key "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface CliArgs {
  url?: string;
  key?: string;
  payload?: string;
  adminKey?: string;
  adminKeyFile?: string;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--url' && i + 1 < process.argv.length) {
      args.url = process.argv[++i];
    } else if (process.argv[i] === '--key' && i + 1 < process.argv.length) {
      args.key = process.argv[++i].replace(/\\n/g, '\n');
    } else if (process.argv[i] === '--payload' && i + 1 < process.argv.length) {
      args.payload = process.argv[++i];
    } else if (process.argv[i] === '--admin-key' && i + 1 < process.argv.length) {
      args.adminKey = process.argv[++i].replace(/\\n/g, '\n');
    } else if (process.argv[i] === '--admin-key-file' && i + 1 < process.argv.length) {
      args.adminKeyFile = process.argv[++i];
    }
  }
  return args;
}

function encryptPayload(payload: string, publicKey: string): string {
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(payload),
  );
  return encrypted.toString('base64');
}

function signPayload(payload: Record<string, any>, adminPrivateKey: string): string {
  const jsonString = JSON.stringify(payload);
  const sign = crypto.createSign('sha256');
  sign.update(jsonString);
  return sign.sign(adminPrivateKey, 'base64');
}

async function main() {
  try {
    const args = parseArgs();

    // Get server public key
    let publicKey = args.key;
    if (!publicKey && args.url) {
      console.log(`📥 Fetching server public key from ${args.url}/webhooks/public-key...`);
      const response = await fetch(`${args.url}/webhooks/public-key`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch public key: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      publicKey = data.publicKey;
    }

    if (!publicKey) {
      throw new Error(
        'Public key required. Provide --url or --key parameter',
      );
    }

    // Get payload
    if (!args.payload) {
      throw new Error('Payload required. Provide --payload parameter');
    }

    // Validate JSON
    const payloadObj = JSON.parse(args.payload);

    // Encrypt
    console.log('🔐 Encrypting payload with server public key...');
    const encrypted = encryptPayload(args.payload, publicKey);

    // Prepare request body
    const requestBody = {
      encryptedPayload: encrypted,
      organizationId: payloadObj.organizationId,
      correlationId: `demo-${Date.now()}`,
    };

    // Sign if admin key provided
    let signature: string | null = null;
    if (args.adminKey || args.adminKeyFile) {
      console.log('🔏 Signing request with admin private key...');
      
      let adminPrivateKey = args.adminKey;
      if (!adminPrivateKey && args.adminKeyFile) {
        if (!fs.existsSync(args.adminKeyFile)) {
          throw new Error(`Admin private key file not found: ${args.adminKeyFile}`);
        }
        adminPrivateKey = fs.readFileSync(args.adminKeyFile, 'utf-8');
      }

      if (!adminPrivateKey) {
        throw new Error('Admin private key required for signing');
      }

      signature = signPayload(requestBody, adminPrivateKey);
      console.log('✅ Request signed');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Encrypted payload (base64):\n');
    console.log(encrypted);
    
    console.log('\n💡 Request body:\n');
    console.log(JSON.stringify(requestBody, null, 2));

    if (signature) {
      console.log('\n🔐 Request signature (add as x-webhook-signature header):\n');
      console.log(signature);
      
      console.log('\n📤 Complete CURL command:\n');
      console.log(`curl -X POST ${args.url}/webhooks/corridors/create \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-signature: ${signature}" \\
  -d '${JSON.stringify(requestBody)}'`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error(
      '❌ Error:',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

main();
