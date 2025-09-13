import { registerAs } from '@nestjs/config';

export const blockchainConfig = registerAs('blockchain', () => ({
  rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
  wsUrl: process.env.SEPOLIA_WS_URL, // WebSocket URL for better event listening
  contractAddress: process.env.CONTRACT_ADDRESS,
  privateKey: process.env.DEPLOYER_PRIVATE_KEY,
  gasPrice: process.env.GAS_PRICE || '20', // gwei
  gasLimit: parseInt(process.env.GAS_LIMIT || '500000'),
  chainId: parseInt(process.env.CHAIN_ID || '11155111'), // Sepolia
  etherscanApiKey: process.env.ETHERSCAN_API_KEY,
  maxRetries: parseInt(process.env.BLOCKCHAIN_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.BLOCKCHAIN_RETRY_DELAY || '5000'), // ms
  enabled: process.env.BLOCKCHAIN_ENABLED !== 'false', // Allow disabling blockchain
  skipEventListening: process.env.SKIP_BLOCKCHAIN_EVENTS === 'true', // Skip event listeners if needed
}));

// packages/backend/src/common/middleware/logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('Content-Length');
      const responseTime = Date.now() - startTime;

      const logMessage = `${method} ${originalUrl} ${statusCode} ${contentLength || 0}b - ${responseTime}ms - ${ip} - ${userAgent}`;
      
      if (statusCode >= 400) {
        this.logger.error(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
