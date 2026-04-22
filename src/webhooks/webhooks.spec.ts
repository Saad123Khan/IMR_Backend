import * as crypto from 'crypto';
import { EncryptionUtil } from '@src/webhooks/utils/encryption.util';

describe('Webhook Encryption', () => {
  describe('RSA-2048 Key Pair Generation', () => {
    it('should generate valid public and private keys', () => {
      const keyPair = EncryptionUtil.generateKeyPair();

      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.publicKey).toContain('BEGIN PUBLIC KEY');
      expect(keyPair.privateKey).toContain('BEGIN PRIVATE KEY');
    });
  });

  describe('Encryption & Decryption', () => {
    let keyPair: { publicKey: string; privateKey: string };

    beforeAll(() => {
      keyPair = EncryptionUtil.generateKeyPair();
    });

    it('should encrypt payload with public key', () => {
      const payload = {
        organizationId: 'org-123',
        mto: 'WESTERN_UNION',
        country: 'USA',
        paymentChannel: 'bank',
        currency: 'USD',
        feeType: 'FIXED_FEES',
        marginType: 'FIXED_MARGIN',
        status: 'active',
      };

      const encrypted = EncryptionUtil.encryptWithPublicKey(
        payload,
        keyPair.publicKey,
      );

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should decrypt payload with private key', () => {
      const payload = {
        organizationId: 'org-123',
        mto: 'WESTERN_UNION',
        country: 'USA',
        paymentChannel: 'bank',
        currency: 'USD',
        feeType: 'FIXED_FEES',
        marginType: 'FIXED_MARGIN',
        status: 'active',
      };

      const encrypted = EncryptionUtil.encryptWithPublicKey(
        payload,
        keyPair.publicKey,
      );
      const decrypted = EncryptionUtil.decryptWithPrivateKey(
        encrypted,
        keyPair.privateKey,
      );

      expect(decrypted).toEqual(payload);
    });

    it('should fail to decrypt with wrong private key', () => {
      const payload = {
        organizationId: 'org-123',
        mto: 'WESTERN_UNION',
      };

      const encrypted = EncryptionUtil.encryptWithPublicKey(
        payload,
        keyPair.publicKey,
      );
      const wrongKeyPair = EncryptionUtil.generateKeyPair();

      expect(() => {
        EncryptionUtil.decryptWithPrivateKey(encrypted, wrongKeyPair.privateKey);
      }).toThrow();
    });
  });

  describe('Digital Signatures', () => {
    let keyPair: { publicKey: string; privateKey: string };

    beforeAll(() => {
      keyPair = EncryptionUtil.generateKeyPair();
    });

    it('should sign payload with private key', () => {
      const payload = {
        success: true,
        corridorId: 'corridor-uuid',
        timestamp: new Date().toISOString(),
      };

      const signature = EncryptionUtil.signWithPrivateKey(
        payload,
        keyPair.privateKey,
      );

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should verify valid signature', () => {
      const payload = {
        success: true,
        corridorId: 'corridor-uuid',
        timestamp: new Date().toISOString(),
      };

      const signature = EncryptionUtil.signWithPrivateKey(
        payload,
        keyPair.privateKey,
      );
      const isValid = EncryptionUtil.verifySignature(
        payload,
        signature,
        keyPair.publicKey,
      );

      expect(isValid).toBe(true);
    });

    it('should reject tampered payload', () => {
      const payload = {
        success: true,
        corridorId: 'corridor-uuid',
        timestamp: new Date().toISOString(),
      };

      const signature = EncryptionUtil.signWithPrivateKey(
        payload,
        keyPair.privateKey,
      );

      const tamperedPayload = {
        success: false,
        corridorId: 'different-uuid',
        timestamp: payload.timestamp,
      };

      const isValid = EncryptionUtil.verifySignature(
        tamperedPayload,
        signature,
        keyPair.publicKey,
      );

      expect(isValid).toBe(false);
    });
  });

  describe('HMAC Signature', () => {
    it('should generate HMAC with shared secret', () => {
      const payload = { data: 'test' };
      const secret = 'super-secret-key';

      const hmac = EncryptionUtil.generateHMAC(payload, secret);

      expect(hmac).toBeDefined();
      expect(typeof hmac).toBe('string');
      expect(hmac.length).toBeGreaterThan(0);
    });

    it('should verify valid HMAC', () => {
      const payload = { data: 'test' };
      const secret = 'super-secret-key';

      const hmac = EncryptionUtil.generateHMAC(payload, secret);
      const isValid = EncryptionUtil.verifyHMAC(payload, hmac, secret);

      expect(isValid).toBe(true);
    });

    it('should reject invalid HMAC', () => {
      const payload = { data: 'test' };
      const secret = 'super-secret-key';

      const hmac = EncryptionUtil.generateHMAC(payload, secret);
      const wrongSecret = 'different-secret';

      const isValid = EncryptionUtil.verifyHMAC(payload, hmac, wrongSecret);

      expect(isValid).toBe(false);
    });
  });

  describe('Round-trip Encryption & Signature', () => {
    it('should encrypt, sign, verify, and decrypt', () => {
      const keyPair = EncryptionUtil.generateKeyPair();

      const originalPayload = {
        organizationId: 'org-123',
        mto: 'WESTERN_UNION',
        country: 'USA',
        paymentChannel: 'bank',
        currency: 'USD',
        feeType: 'FIXED_FEES',
        marginType: 'FIXED_MARGIN',
        status: 'active',
      };

      // 1. Encrypt
      const encrypted = EncryptionUtil.encryptWithPublicKey(
        originalPayload,
        keyPair.publicKey,
      );

      // 2. Sign
      const signature = EncryptionUtil.signWithPrivateKey(
        { encrypted },
        keyPair.privateKey,
      );

      // 3. Verify signature
      const isSignatureValid = EncryptionUtil.verifySignature(
        { encrypted },
        signature,
        keyPair.publicKey,
      );

      // 4. Decrypt
      const decrypted = EncryptionUtil.decryptWithPrivateKey(
        encrypted,
        keyPair.privateKey,
      );

      expect(isSignatureValid).toBe(true);
      expect(decrypted).toEqual(originalPayload);
    });
  });
});
