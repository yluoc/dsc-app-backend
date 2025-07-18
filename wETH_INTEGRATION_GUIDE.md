# wETH Integration Guide

## Overview

This guide explains the new wETH (Wrapped Ethereum) integration functionality that allows users to deposit ETH and use it as collateral in the DSC (Decentralized Stable Coin) system.

## Workflow

The integration provides a seamless flow: **ETH → wETH → Collateral → DSC Minting**

### Traditional DeFi Flow (Before Integration)
1. User manually wraps ETH to wETH using external service
2. User approves DSC Engine to spend wETH  
3. User deposits wETH as collateral
4. User mints DSC tokens

### New Integrated Flow (After Integration)
1. **Single API call** handles: ETH → wETH → Approval → Collateral Deposit → DSC Minting

## wETH Contract Details

- **Contract Address**: `0xdd13E55209Fd76AfE204dBda4007C227904f0a81` (Sepolia Testnet)
- **Token Standard**: ERC-20 with deposit/withdraw functionality
- **1 ETH = 1 wETH** (1:1 conversion ratio)

## New API Endpoints

### 1. wETH Information
**GET** `/api/weth/info`
- **Query Parameters**: `address` (optional)
- **Description**: Get wETH token info and user balances

**Examples:**
```bash
# Get general wETH token information
curl "http://localhost:3000/api/weth/info"

# Get user-specific ETH and wETH balances
curl "http://localhost:3000/api/weth/info?address=0x1234567890123456789012345678901234567890"
```

### 2. Wrap ETH to wETH  
**POST** `/api/weth/wrap`
- **Body**: `{ "ethAmount": "1.0", "privateKey": "0x..." }`
- **Description**: Convert ETH to wETH tokens

**Example:**
```bash
curl -X POST http://localhost:3000/api/weth/wrap \
  -H "Content-Type: application/json" \
  -d '{
    "ethAmount": "0.5",
    "privateKey": "0xYOUR_PRIVATE_KEY"
  }'
```

### 3. Unwrap wETH to ETH
**POST** `/api/weth/unwrap`  
- **Body**: `{ "wethAmount": "1.0", "privateKey": "0x..." }`
- **Description**: Convert wETH back to ETH

**Example:**
```bash
curl -X POST http://localhost:3000/api/weth/unwrap \
  -H "Content-Type: application/json" \
  -d '{
    "wethAmount": "0.3",
    "privateKey": "0xYOUR_PRIVATE_KEY"
  }'
```

### 4. ETH → wETH → Collateral Deposit
**POST** `/api/weth/deposit-as-collateral`
- **Body**: `{ "ethAmount": "1.0", "privateKey": "0x..." }`
- **Description**: Complete workflow to deposit ETH as wETH collateral

**Example:**
```bash
curl -X POST http://localhost:3000/api/weth/deposit-as-collateral \
  -H "Content-Type: application/json" \
  -d '{
    "ethAmount": "1.0",
    "privateKey": "0xYOUR_PRIVATE_KEY"
  }'
```

### 5. ETH → wETH → Collateral → Mint DSC (Complete Flow)
**POST** `/api/weth/deposit-and-mint`
- **Body**: `{ "ethAmount": "2.0", "dscToMint": "500", "privateKey": "0x..." }`
- **Description**: End-to-end workflow from ETH to DSC tokens

**Example:**
```bash
curl -X POST http://localhost:3000/api/weth/deposit-and-mint \
  -H "Content-Type: application/json" \
  -d '{
    "ethAmount": "2.0",
    "dscToMint": "500",
    "privateKey": "0xYOUR_PRIVATE_KEY"
  }'
```

## Response Examples

### Successful wETH Wrap Response
```json
{
  "success": true,
  "data": {
    "ethAmountWrapped": "1.0",
    "transactionHash": "0x1234567890abcdef...",
    "blockNumber": 12345,
    "gasUsed": "65000",
    "status": 1,
    "userAddress": "0x1234567890123456789012345678901234567890",
    "balances": {
      "newETHBalance": "4.93425",
      "newWETHBalance": "1.0"
    }
  }
}
```

### Complete Workflow Response
```json
{
  "success": true,
  "data": {
    "workflow": "ETH → wETH → Collateral Deposit → DSC Mint",
    "ethAmountProcessed": "2.0",
    "dscMinted": "500",
    "userAddress": "0x1234567890123456789012345678901234567890",
    "steps": {
      "step1_wrap": {
        "description": "Wrapped ETH to wETH",
        "transactionHash": "0xabc123...",
        "gasUsed": "65000"
      },
      "step2_approve": {
        "description": "Approved DSC Engine to spend wETH",
        "transactionHash": "0xdef456...",
        "gasUsed": "45000"
      },
      "step3_depositAndMint": {
        "description": "Deposited wETH as collateral and minted DSC",
        "transactionHash": "0x789xyz...",
        "gasUsed": "180000"
      }
    },
    "balances": {
      "before": {
        "eth": "5.0",
        "weth": "0.0",
        "dsc": "0.0"
      },
      "after": {
        "eth": "2.91",
        "weth": "0.0",
        "dsc": "500.0"
      },
      "changes": {
        "ethUsed": "2.09",
        "wethCollateral": "2.0",
        "dscReceived": "500.0"
      }
    },
    "dscAccount": {
      "totalDscMinted": "500.0",
      "collateralValueInUsd": "6000.0",
      "healthFactor": "6.0",
      "wethCollateralDeposited": "2.0"
    }
  }
}
```

## Integration Architecture

### Service Layer Structure
```
DSCService (Main)
├── DSCEngineService (Collateral & Minting)
├── WETHService (ETH ↔ wETH Conversion) ← NEW
└── DSC Token Service (DSC Token Operations)
```

### wETH Service Methods
```javascript
// Read Operations
await dscService.weth.getBalance(address)
await dscService.weth.getETHBalance(address) 
await dscService.weth.getAllowance(owner, spender)
await dscService.weth.getTokenInfo()

// Write Operations (Require Private Key)
await dscService.weth.depositETH(amount)        // ETH → wETH
await dscService.weth.withdrawETH(amount)       // wETH → ETH
await dscService.weth.approve(spender, amount)  // Approve spending
await dscService.weth.transfer(to, amount)      // Transfer wETH

// Combined Operations
await dscService.weth.depositETHAndApprove(ethAmount, spender, approveAmount)
```

## Error Handling

All endpoints include comprehensive error handling:

- **Validation Errors**: Invalid addresses, amounts, or missing parameters
- **Balance Checks**: Insufficient ETH/wETH balance verification  
- **Transaction Failures**: Blockchain transaction error details
- **Network Issues**: RPC connection and network problems

**Example Error Response:**
```json
{
  "success": false,
  "error": "Insufficient ETH balance",
  "details": "Available: 0.5 ETH, Required: 1.0 ETH"
}
```

## Gas Estimation

Typical gas usage for operations:
- **ETH → wETH**: ~65,000 gas
- **wETH Approval**: ~45,000 gas  
- **Collateral Deposit**: ~120,000 gas
- **DSC Minting**: ~80,000 gas
- **Complete Workflow**: ~290,000 gas total

## Security Considerations

1. **Private Key Handling**: Never log or store private keys
2. **Amount Validation**: All amounts validated before processing
3. **Balance Verification**: ETH/wETH balances checked before operations
4. **Transaction Confirmation**: All transactions wait for confirmation
5. **Error Recovery**: Detailed error messages for debugging

## Testing

Use Sepolia testnet for testing:
1. Get Sepolia ETH from faucets
2. Test individual endpoints before workflows
3. Monitor transaction hashes on Etherscan
4. Verify balance changes after operations

## Next Steps

1. **Test the integration** with small amounts first
2. **Monitor gas costs** during high network activity  
3. **Implement frontend integration** using these API endpoints
4. **Add transaction history** tracking for user operations
5. **Consider batch operations** for gas optimization

## Support

For issues or questions about the wETH integration:
- Check transaction hashes on Sepolia Etherscan
- Verify contract addresses match the integration
- Ensure sufficient ETH for gas fees
- Review error messages for specific validation failures 