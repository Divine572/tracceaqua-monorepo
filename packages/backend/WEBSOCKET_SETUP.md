# WebSocket Setup for Blockchain Connection

## Why WebSocket?

WebSocket connections are much more reliable for blockchain event listening because:
- ✅ Persistent connection (no filter expiration)
- ✅ Real-time events
- ✅ Automatic reconnection in ethers v6
- ✅ No "filter not found" errors

## Configuration

Add this environment variable to your `.env` file:

```bash
# WebSocket URL for Sepolia testnet
SEPOLIA_WS_URL=wss://ethereum-sepolia-rpc.publicnode.com

# Or use other providers:
# Alchemy WebSocket
# SEPOLIA_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Infura WebSocket  
# SEPOLIA_WS_URL=wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID

# QuickNode WebSocket
# SEPOLIA_WS_URL=wss://your-endpoint.quiknode.pro/YOUR_KEY/
```

## Free WebSocket Providers

### 1. Public Nodes (Free, Rate Limited)
```bash
SEPOLIA_WS_URL=wss://ethereum-sepolia-rpc.publicnode.com
```

### 2. Alchemy (Free Tier: 300M requests/month)
1. Sign up at https://alchemy.com
2. Create a new app for Sepolia
3. Get your WebSocket URL:
```bash
SEPOLIA_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### 3. Infura (Free Tier: 100k requests/day)
1. Sign up at https://infura.io
2. Create a new project
3. Get your WebSocket URL:
```bash
SEPOLIA_WS_URL=wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID
```

### 4. QuickNode (Free Trial)
1. Sign up at https://quicknode.com
2. Create a Sepolia endpoint
3. Get your WebSocket URL:
```bash
SEPOLIA_WS_URL=wss://your-endpoint.quiknode.pro/YOUR_KEY/
```

## Testing the Connection

You can test if your WebSocket URL works by running:

```bash
# Test WebSocket connection
wscat -c wss://ethereum-sepolia-rpc.publicnode.com

# Send a test request
{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}
```

## Fallback Strategy

The service will:
1. **First**: Try WebSocket if `SEPOLIA_WS_URL` is provided
2. **Fallback**: Use HTTP RPC if WebSocket fails or isn't configured
3. **Graceful**: Continue working even if blockchain connection fails

## Restart Your Application

After adding the WebSocket URL:

```bash
# Stop your application
# Update your .env file with SEPOLIA_WS_URL
# Restart your application

npm run start:dev
# or
pnpm run start:dev
```

## Monitoring

Watch your logs for:
- ✅ `Using WebSocket provider for better event handling`
- ⚠️ `Using HTTP provider (consider using WebSocket...)`
- ❌ `WebSocket connection error` (if issues persist)
