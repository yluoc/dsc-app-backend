import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'running',
    message: 'DSC Smart Contract Backend API is operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      token: {
        read: {
          'GET /api/token/info': 'Get token information (name, symbol, total supply, owner)',
          'GET /api/token/balance?address=0x...': 'Get token balance for an address',
          'GET /api/token/allowance?owner=0x...&spender=0x...': 'Get allowance between addresses'
        },
        write: {
          'POST /api/token/mint': 'Mint new tokens (owner only)',
          'POST /api/token/burn': 'Burn tokens from signer',
          'POST /api/token/transfer': 'Transfer tokens to another address',
          'POST /api/token/approve': 'Approve another address to spend tokens'
        }
      },
      engine: {
        read: {
          'GET /api/engine/account?user=0x...': 'Get account information (DSC minted, collateral value, health factor)',
          'GET /api/engine/collateral?user=0x...': 'Get all collateral tokens for user',
          'GET /api/engine/collateral?user=0x...&token=0x...': 'Get specific collateral balance and price feed'
        },
        write: {
          'POST /api/engine/deposit': 'Deposit collateral',
          'POST /api/engine/mint': 'Mint DSC tokens',
          'POST /api/engine/deposit-and-mint': 'Deposit collateral and mint DSC in one transaction',
          'POST /api/engine/redeem': 'Redeem collateral',
          'POST /api/engine/burn': 'Burn DSC tokens',
          'POST /api/engine/redeem-and-burn': 'Redeem collateral and burn DSC in one transaction',
          'POST /api/engine/liquidate': 'Liquidate a position'
        }
      }
    },
    contracts: {
      dscToken: {
        address: '0x2c3B2411D8BEeA449f3dfbdAA80bE8C290a159C3',
        type: 'ERC20 with mint/burn functionality'
      },
      dscEngine: {
        address: '0x38febeed266b885a6d84f129463330f81f02df86',
        type: 'DeFi Lending Protocol with collateral management'
      },
      network: 'Configured via BLOCKCHAIN_RPC_URL environment variable'
    },
    tech: {
      framework: 'Next.js 15 with App Router',
      blockchain: 'Ethers.js v6',
      language: 'JavaScript/Node.js',
      architecture: 'RESTful API with proper error handling'
    },
    examples: {
      token: {
        'Get token info': 'curl http://localhost:3000/api/token/info',
        'Get balance': 'curl "http://localhost:3000/api/token/balance?address=0x..."',
        'Mint tokens': 'curl -X POST http://localhost:3000/api/token/mint -H "Content-Type: application/json" -d \'{"to":"0x...","amount":"100","privateKey":"0x..."}\''
      },
      engine: {
        'Get account info': 'curl "http://localhost:3000/api/engine/account?user=0x..."',
        'Get collateral': 'curl "http://localhost:3000/api/engine/collateral?user=0x..."',
        'Deposit collateral': 'curl -X POST http://localhost:3000/api/engine/deposit -H "Content-Type: application/json" -d \'{"tokenCollateralAddress":"0x...","amountCollateral":"100","privateKey":"0x..."}\'',
        'Mint DSC': 'curl -X POST http://localhost:3000/api/engine/mint -H "Content-Type: application/json" -d \'{"amountDscToMint":"50","privateKey":"0x..."}\''
      }
    }
  });
} 