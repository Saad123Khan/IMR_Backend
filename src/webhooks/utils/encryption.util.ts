import * as crypto from 'crypto';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class EncryptionUtil {
  /**
   * Generate RSA-2048 key pair (one-time setup)
   * Store public key on client, private key on server
   */
  static generateKeyPair(): KeyPair {
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

    return {
      publicKey: publicKey.toString(),
      privateKey: privateKey.toString(),
    };
  }

  /**
   * Encrypt payload with public key (client-side before sending)
   * @param payload Data to encrypt
   * @param publicKey Public key in PEM format
   */
  static encryptWithPublicKey(
    payload: Record<string, any>,
    publicKey: string,
  ): string {
    const jsonString = JSON.stringify(payload);
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(jsonString),
    );
    return encrypted.toString('base64');
  }

  /**
   * Decrypt payload with private key (server-side)
   * @param encryptedPayload Base64 encoded encrypted data
   * @param privateKey Private key in PEM format
   */
  static decryptWithPrivateKey(
    encryptedPayload: string,
    privateKey: string,
  ): Record<string, any> {
    try {
      const decrypted = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedPayload, 'base64'),
      );
      return JSON.parse(decrypted.toString());
    } catch (error) {
      throw new Error('Decryption failed: invalid payload or key');
    }
  }

  /**
   * Sign payload with private key (server response signature)
   * @param payload Data to sign
   * @param privateKey Private key in PEM format
   */
  static signWithPrivateKey(
    payload: Record<string, any>,
    privateKey: string,
  ): string {
    const jsonString = JSON.stringify(payload);
    const sign = crypto.createSign('sha256');
    sign.update(jsonString);
    return sign.sign(privateKey, 'base64');
  }

  /**
   * Verify signature with public key (client-side verification)
   * @param payload Original data
   * @param signature Base64 encoded signature
   * @param publicKey Public key in PEM format
   */
  static verifySignature(
    payload: Record<string, any>,
    signature: string,
    publicKey: string,
  ): boolean {
    try {
      const jsonString = JSON.stringify(payload);
      const verify = crypto.createVerify('sha256');
      verify.update(jsonString);
      return verify.verify(publicKey, signature, 'base64');
    } catch {
      return false;
    }
  }

  /**
   * Generate HMAC signature for request validation
   * @param payload Data to sign
   * @param secret Shared secret key
   */
  static generateHMAC(payload: Record<string, any>, secret: string): string {
    const jsonString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(jsonString)
      .digest('base64');
  }

  /**
   * Verify HMAC signature
   * @param payload Original data
   * @param signature HMAC signature to verify
   * @param secret Shared secret key
   */
  static verifyHMAC(
    payload: Record<string, any>,
    signature: string,
    secret: string,
  ): boolean {
    const expectedSignature = this.generateHMAC(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}
