# DSC App Backend

A Next.js backend API for interacting with the DSC (Decentralized Stable Coin) smart contract ecosystem, including token operations and DeFi lending protocol functionality.

## Features

- **RESTful API** for smart contract interactions
- **Token Operations**: Mint, burn, transfer, approve, balance checking
- **DeFi Engine**: Deposit collateral, mint/burn DSC, liquidate positions
- **Read Operations**: Token info, balance, allowance, account status, collateral info
- **Write Operations**: All token and engine transactions
- **Input Validation**: Comprehensive address and amount validation
- **Error Handling**: Standardized error responses with detailed logging
- **Security**: Private key validation and transaction signing
- **API Status**: Built-in status endpoint with complete API documentation

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to an Ethereum RPC endpoint (local, testnet, or mainnet)

## Smart Contract Integration

The backend integrates with two main smart contracts:

### DSC Token Contract (`0x2c3B2411D8BEeA449f3dfbdAA80bE8C290a159C3`)
- **ERC20 Token** with mint/burn functionality
- **Owner-controlled minting** for initial distribution
- **Standard ERC20 functions**: transfer, approve, allowance, balanceOf

### DSC Engine Contract (`0x38febeed266b885a6d84f129463330f81f02df86`)
- **DeFi Lending Protocol** with collateral management
- **Collateral deposits** and **DSC minting**
- **Health factor monitoring** and **liquidation system**
- **Price feed integration** for collateral valuation