# DSC App Backend API Documentation

This backend provides a RESTful API to interact with the DSC (Decentralized Stable Coin) smart contract.

## Base URL
```
http://localhost:3000/api
```

## Authentication
For write operations (mint, burn, transfer, approve), you need to provide a private key in the request body. **Never expose private keys in production applications.**

## Endpoints

### 1. Get Token Information
**GET** `/token/info`

Returns basic information about the token.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Decentralized Stable Coin",
    "symbol": "DSC",
    "decimals": "18",
    "totalSupply": "1000000.0",
    "owner": "0x...",
    "contractAddress": "0x2c3B2411D8BEeA449f3dfbdAA80bE8C290a159C3"
  }
}
```

### 2. Get Token Balance
**GET** `/token/balance?address=0x...`

Returns the token balance for a specific address.

**Parameters:**
- `address` (required): Ethereum address to check balance for

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "balance": "100.5",
    "symbol": "DSC"
  }
}
```

### 3. Get Allowance
**GET** `/token/allowance?owner=0x...&spender=0x...`

Returns the allowance amount between owner and spender.

**Parameters:**
- `owner` (required): Address that owns the tokens
- `spender` (required): Address that can spend the tokens

**Response:**
```json
{
  "success": true,
  "data": {
    "owner": "0x...",
    "spender": "0x...",
    "allowance": "50.0",
    "symbol": "DSC"
  }
}
```

### 4. Mint Tokens
**POST** `/token/mint`

Mints new tokens to a specified address. Requires owner privileges.

**Request Body:**
```json
{
  "to": "0x...",
  "amount": "100.5",
  "privateKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipient": "0x...",
    "amount": "100.5",
    "transactionHash": "0x...",
    "blockNumber": 12345,
    "gasUsed": "50000",
    "status": 1
  }
}
```

### 5. Burn Tokens
**POST** `/token/burn`

Burns tokens from the signer's address.

**Request Body:**
```json
{
  "amount": "50.0",
  "privateKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "amount": "50.0",
    "transactionHash": "0x...",
    "blockNumber": 12346,
    "gasUsed": "45000",
    "status": 1
  }
}
```

### 6. Transfer Tokens
**POST** `/token/transfer`

Transfers tokens from the signer to another address.

**Request Body:**
```json
{
  "to": "0x...",
  "amount": "25.0",
  "privateKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recipient": "0x...",
    "amount": "25.0",
    "transactionHash": "0x...",
    "blockNumber": 12347,
    "gasUsed": "65000",
    "status": 1
  }
}
```

### 7. Approve Tokens
**POST** `/token/approve`

Approves another address to spend tokens on behalf of the signer.

**Request Body:**
```json
{
  "spender": "0x...",
  "amount": "100.0",
  "privateKey": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "spender": "0x...",
    "amount": "100.0",
    "transactionHash": "0x...",
    "blockNumber": 12348,
    "gasUsed": "35000",
    "status": 1
  }
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid parameters)
- `500`: Internal Server Error (blockchain/contract errors)

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy `env.example` to `.env.local` and configure:
   ```bash
   cp env.example .env.local
   ```

3. **Configure Blockchain Connection:**
   - Set `BLOCKCHAIN_RPC_URL` to your preferred RPC endpoint
   - For local development: `http://localhost:8545`
   - For testnet: Use Infura, Alchemy, or other providers

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Security Considerations

1. **Private Key Management:**
   - Never hardcode private keys in production
   - Use secure key management systems
   - Consider using hardware wallets for production

2. **Environment Variables:**
   - Keep sensitive data in environment variables
   - Use different keys for different environments

3. **Input Validation:**
   - All addresses are validated for proper Ethereum format
   - Amounts are validated for positive numbers
   - Consider additional validation for production use

## Testing

You can test the API using curl or any HTTP client:

```bash
# Get token info
curl http://localhost:3000/api/token/info

# Get balance
curl "http://localhost:3000/api/token/balance?address=0x..."

# Mint tokens (replace with actual values)
curl -X POST http://localhost:3000/api/token/mint \
  -H "Content-Type: application/json" \
  -d '{"to":"0x...","amount":"100","privateKey":"0x..."}'
```

## Smart Contract Functions Supported

- `name()`: Get token name
- `symbol()`: Get token symbol
- `decimals()`: Get token decimals
- `totalSupply()`: Get total supply
- `balanceOf(address)`: Get balance of address
- `allowance(owner, spender)`: Get allowance
- `owner()`: Get contract owner
- `mint(to, amount)`: Mint new tokens
- `burn(amount)`: Burn tokens
- `transfer(to, amount)`: Transfer tokens
- `approve(spender, amount)`: Approve spending
- `renounceOwnership()`: Renounce ownership 