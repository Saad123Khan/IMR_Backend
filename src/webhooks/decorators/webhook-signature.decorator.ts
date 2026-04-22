import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EncryptionUtil } from '../utils/encryption.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookSignatureMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers['x-webhook-signature'] as string;
    const publicKey = this.configService.get<string>('WEBHOOK_PUBLIC_KEY');

    if (!signature || !publicKey) {
      throw new BadRequestException(
        'Missing webhook signature or public key not configured',
      );
    }

    // Store raw body for signature verification
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(rawBody);

        // Verify RSA signature
        const isValid = EncryptionUtil.verifySignature(
          payload,
          signature,
          publicKey,
        );

        if (!isValid) {
          throw new BadRequestException('Invalid webhook signature');
        }

        req.body = payload;
        next();
      } catch (error) {
        throw new BadRequestException(
          'Invalid webhook signature or malformed payload',
        );
      }
    });
  }
}
