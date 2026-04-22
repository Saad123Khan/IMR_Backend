# Webhook Listener Setup Guide

## Overview

The webhook listener allows a **separate admin backend** to securely create corridors in the client portal backend using **RSA-2048 encryption** with two-way authentication.

### Security Architecture

```
Admin Backend                           Remit Now Server
─────────────────────────────────────────────────────────
1. Has admin private key           ←→  Has admin public key
   (signs requests)                    (verifies signatures)

2. Encrypts with server            ←→  Has server private key
   public key                          (decrypts payloads)

3. Receives response                ←→  Signs response with
   verified with server public key     server private key
```

### Request Flow

1. **Admin Backend**:
   - Encrypts corridor data with server's public key
   - Signs the encrypted payload with admin private key
   - Sends request with `x-webhook-signature` header

2. **Server**:
   - Verifies request signature using admin public key
   - Decrypts payload using server private key
   - Creates corridor, signs response with server private key
   - Returns response

3. **Admin Backend**:
   - Verifies response signature using server public key

## Setup Instructions

### ⚠️ Critical Requirement

**The `ADMIN_WEBHOOK_PUBLIC_KEY` environment variable MUST be set on the Remit Now Server for webhook requests to be accepted.** Without this key configured, all webhook requests will be rejected with a 400 error. This key is provided by the admin backend team and used to verify the digital signature of every incoming webhook request.

### Step 1: Remit Now Server Generates Its Keys (One-Time)

In the **Remit Now Backend** project, generate RSA-2048 key pair:

```bash
npm run webhook:generate-keys
```

This creates in `.webhook-keys/`:
- `public-key.pem` - Share with admin backend team(s)
- `private-key.pem` - **KEEP SECURE** (set as WEBHOOK_PRIVATE_KEY env var)

### Step 2: Configure Server Environment

Add to **Remit Now Server** `.env`:

```env
# Server's encryption keys (for payload encryption/decryption)
WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
WEBHOOK_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Admin Backend's public key (REQUIRED for webhook signature verification)
# This will be provided by the admin backend team and MUST be set for the server to accept webhooks
ADMIN_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

**⚠️ IMPORTANT**: Without `ADMIN_WEBHOOK_PUBLIC_KEY` set, the webhook endpoint will reject all requests with a 400 error. This key MUST be provided before webhook requests can be accepted.

### Step 3: Admin Backend Generates Its Keys

**In the admin backend project**, generate its own RSA-2048 key pair.

**Option A: Using a Node.js environment** (similar to `webhook-keys` generation):

Create a script in your admin backend project (e.g., `scripts/generate-webhook-keys.ts`):

```typescript
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const keysDir = path.join(__dirname, '../.webhook-keys');
if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

fs.writeFileSync(path.join(keysDir, 'admin-public-key.pem'), publicKey);
fs.writeFileSync(path.join(keysDir, 'admin-private-key.pem'), privateKey);

console.log('✅ Admin webhook keys generated!');
console.log(`
Public key location: ${path.join(keysDir, 'admin-public-key.pem')}
Private key location: ${path.join(keysDir, 'admin-private-key.pem')}

Share admin-public-key.pem with Remit Now Server team.
Set ADMIN_WEBHOOK_PRIVATE_KEY env var to admin-private-key.pem content.
`);
```

Then run it with:
```bash
npm run webhook:generate-keys  # or ts-node scripts/generate-webhook-keys.ts
```

**Option B: Using OpenSSL** (any environment):

```bash
mkdir -p .webhook-keys
openssl genrsa -out .webhook-keys/admin-private-key.pem 2048
openssl rsa -in .webhook-keys/admin-private-key.pem -pubout -out .webhook-keys/admin-public-key.pem
echo "✅ Admin webhook keys generated in .webhook-keys/"
```

This creates:
- `admin-private-key.pem` - Keep secure (for signing requests)
- `admin-public-key.pem` - Share with Remit Now Server team

### Step 4: Exchange Public Keys & Enable Webhooks

1. **Admin Backend team** generates admin keys (Step 3) and sends `admin-public-key.pem` to **Remit Now Server team**
2. **Server team** adds the admin public key to their `.env`:
   ```env
   ADMIN_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
   ```
   **This step is REQUIRED to enable webhook request signature verification.**
3. **Remit Now Server team** sends their `public-key.pem` to **Admin Backend team**
4. **Admin Backend** configures the server public key in their environment for encrypting requests

### Step 5: Configure Admin Backend Environment

Add to **admin backend** `.env`:

```env
# Remit Now Server public key (for encrypting requests)
REMIT_NOW_SERVER_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Admin's private key (for signing requests)
ADMIN_WEBHOOK_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Step 6: Restart Services

Restart both **Remit Now Server** and **Admin Backend** with updated environment variables.

## Usage (Admin Backend / External Developers)

### Option 1: Using encrypt-payload Script with Signing (Recommended)

In the **admin backend** project, use the script to encrypt and sign requests:

```bash
npm run webhook:encrypt -- \
  --url http://remit-now-server:3000/api/v1 \
  --payload '{"organizationId":"org-123","mto":"WESTERN_UNION","country":"US","paymentChannel":"bank","currency":"USD","feeType":"fixed_fees","marginType":"fixed_margin"}' \
  --admin-key-file .webhook-keys/admin-private-key.pem
```

Or pass the admin private key directly:

```bash
npm run webhook:encrypt -- \
  --url http://localhost:3000/api/v1 \
  --payload '{...}' \
  --admin-key "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

**Output includes:**
- Encrypted payload (base64)
- Request signature (for x-webhook-signature header)
- Complete CURL command ready to use

### Option 2: Manual Encryption & Signing (Any Language)

Get the public keys and encrypt/sign using your language of choice:

```bash
# Get server public key (for encryption)
curl http://localhost:3000/api/v1/webhooks/public-key
```

**Node.js example:**
```typescript
import * as crypto from 'crypto';

const serverPublicKey = '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----';
const adminPrivateKey = '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----';

const payload = {
  organizationId: 'org-123',
  mto: 'WESTERN_UNION',
  country: 'US',
  paymentChannel: 'bank',
  currency: 'USD',
  feeType: 'fixed_fees',
  marginType: 'fixed_margin'
};

// Step 1: Encrypt payload with server public key
const encrypted = crypto.publicEncrypt(
  {
    key: serverPublicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  Buffer.from(JSON.stringify(payload))
);

// Step 2: Prepare request body
const requestBody = {
  encryptedPayload: encrypted.toString('base64'),
  organizationId: 'org-123',
  correlationId: `demo-${Date.now()}`
};

// Step 3: Sign request with admin private key
const sign = crypto.createSign('sha256');
sign.update(JSON.stringify(requestBody));
const signature = sign.sign(adminPrivateKey, 'base64');

// Step 4: Send request with signature header
const response = await fetch('http://localhost:3000/api/v1/webhooks/corridors/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-webhook-signature': signature  // Add signature header
  },
  body: JSON.stringify(requestBody)
});
```
```

**Python example:**
```python
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import json
import base64

public_key_str = '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----'
public_key = RSA.import_key(public_key_str)
cipher = PKCS1_OAEP.new(public_key)

payload = {
    'organizationId': 'org-123',
    'mto': 'WESTERN_UNION',
    'country': 'US',
    'paymentChannel': 'bank',
    'currency': 'USD',
    'feeType': 'fixed_fees',
    'marginType': 'fixed_margin'
}

encrypted = cipher.encrypt(json.dumps(payload).encode())
print(base64.b64encode(encrypted).decode())  # Use this as encryptedPayload
```


## Server Endpoints

### POST /webhooks/corridors/create (Request Signature Required)

Creates a corridor using encrypted and signed payload from admin backend.

**Request Headers:**
```
Content-Type: application/json
x-webhook-signature: base64-encoded-rsa-signature  (REQUIRED)
```

**Request Body:**
```json
{
  "encryptedPayload": "base64-encoded-rsa-encrypted-data",
  "organizationId": "org-uuid",
  "correlationId": "correlation-uuid"
}
```

**Signature Verification:**
All webhook requests REQUIRE signature verification. The server verifies the `x-webhook-signature` header using the admin backend's public key (from `ADMIN_WEBHOOK_PUBLIC_KEY` environment variable). The signature is computed over the entire request body JSON.

**Response:**
```json
{
  "success": true,
  "corridorId": "corridor-uuid",
  "signature": "base64-encoded-rsa-signature",
  "timestamp": "2024-01-30T12:00:00Z",
  "correlationId": "correlation-uuid"
}
```

**Error Responses:**
- `400 Bad Request` - Missing `x-webhook-signature` header (signature is required)
- `400 Bad Request` - `ADMIN_WEBHOOK_PUBLIC_KEY` not configured on server
- `400 Bad Request` - Invalid webhook signature (verification failed)
- `400 Bad Request` - Missing encryptedPayload or organizationId

### POST /webhooks/clients/create (Request Signature Required)

Creates a new client (organization + owner user) using encrypted and signed payload from admin backend.

**Request Headers:**
```
Content-Type: application/json
x-webhook-signature: base64-encoded-rsa-signature  (REQUIRED)
```

**Request Body:**
```json
{
  "encryptedPayload": "base64-encoded-rsa-encrypted-data",
  "correlationId": "correlation-uuid"
}
```

**Decrypt payload structure (before encryption):**
```json
{
  "email": "owner@company.com",
  "phone": "+1234567890",
  "password": "securePassword123",
  "name": "John Doe",
  "organizationName": "Acme Corp"
}
```

**Signature Verification:**
All client creation requests REQUIRE signature verification. The server verifies the `x-webhook-signature` header using the admin backend's public key (from `ADMIN_WEBHOOK_PUBLIC_KEY` environment variable). The signature is computed over the entire request body JSON.

**Response:**
```json
{
  "success": true,
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "signature": "base64-encoded-rsa-signature",
  "timestamp": "2024-01-30T12:00:00Z",
  "correlationId": "correlation-uuid"
}
```

**Error Responses:**
- `400 Bad Request` - Missing `x-webhook-signature` header (signature is required)
- `400 Bad Request` - `ADMIN_WEBHOOK_PUBLIC_KEY` not configured on server
- `400 Bad Request` - Invalid webhook signature (verification failed)
- `400 Bad Request` - Missing encryptedPayload
- `409 Conflict` - Email or phone already exists
- `409 Conflict` - Organization name already exists
- `503 Service Unavailable` - Server error

### GET /webhooks/public-key (Unauthenticated)

Returns server's public key for encryption.

**Response:**
```json
{
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

### GET /webhooks/logs (Authenticated - JWT Required)

Returns audit logs of webhook calls (requires `VIEW_CORRIDOR` permission).

```bash
curl -H "Authorization: Bearer <token>" \
  http://api.server.com/api/v1/webhooks/logs?limit=50&offset=0
```

### GET /webhooks/logs/:correlationId (Authenticated)

Get specific webhook log by correlation ID for tracing.

## Security Features

✅ **RSA-2048 Encryption**: Payload encrypted with server's public key  
✅ **Digital Signatures**: Response signed by server, verified by client  
✅ **Correlation IDs**: Track requests across systems  
✅ **Audit Logs**: All webhook calls logged in `webhook_logs` table  
✅ **No Authentication Required**: Webhook endpoint (encryption is the auth)  

## Troubleshooting

### Decryption Failed
- Ensure public key on client matches server's public key
- Verify payload is encrypted correctly (base64 format)

### Signature Verification Failed
- Ensure server's private key hasn't changed
- Check timestamp hasn't drifted too far

### Corridor Creation Failed
- Check organization exists
- Verify corridor data (mto, country, currency, etc.)
- Review audit logs with correlation ID

## Example: Full Workflow

```typescript
// 1. Fetch public key
const keyRes = await fetch('http://localhost:3000/api/v1/webhooks/public-key');
const { publicKey } = await keyRes.json();

// 2. Create client
const client = new WebhookClient('http://localhost:3000/api/v1', publicKey);

// 3. Send secure request
try {
  const result = await client.createCorridor({
    organizationId: 'org-123',
    mto: 'WESTERN_UNION',
    country: 'US',
    paymentChannel: 'bank',
    currency: 'USD',
    feeType: 'FIXED_FEES',
    marginType: 'FIXED_MARGIN',
    isActive: true,
  });

  console.log('Success:', result.corridorId);
  console.log('Signature Valid:', true); // Client verifies automatically
} catch (error) {
  console.error('Error:', error.message);
}
```

## Migration from Direct API

Previously, corridors were created via:
```bash
POST /api/v1/corridors
Authorization: Bearer <token>
```

Now, use the webhook endpoint instead:
```bash
POST /api/v1/webhooks/corridors/create
(no auth needed, encryption handles security)
```

The direct `/corridors` POST endpoint will be **removed** in a future release per TODO.md.
