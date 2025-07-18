# Test Suite Documentation

This document provides comprehensive information about the test suite for the DSC (Decentralized Stable Coin) backend application.

## Overview

The test suite covers all major components of the DSC backend:

- **Utility functions** (`utils.js`)
- **DSC token service** (`dsc.js`)
- **DSC Engine service** (`dscEngine.js`)
- **API endpoints** (all token and engine endpoints)
- **Integration tests** (end-to-end API testing)

## Test Structure

```
├── jest.config.js           # Jest configuration
├── jest.setup.js           # Global test setup and mocks
├── src/
│   ├── lib/
│   │   └── __tests__/
│   │       ├── utils.test.js      # Utility functions tests
│   │       ├── dsc.test.js        # DSC service tests
│   │       └── dscEngine.test.js  # DSC Engine service tests
│   └── app/
│       └── api/
│           ├── __tests__/
│           │   ├── status.test.js          # Status endpoint tests
│           │   ├── token/
│           │   │   └── token-api.test.js   # All token API tests
│           │   └── engine/
│           │       └── engine-api.test.js  # All engine API tests
└── __tests__/
    └── integration.test.js  # Integration tests
```

## Test Configuration

### Jest Configuration

The project uses Jest with Next.js integration:

- **Environment**: Node.js
- **Setup file**: `jest.setup.js`
- **Coverage**: Configured to collect from `src/**/*.js`
- **Timeout**: 10 seconds for async operations
- **Module mapping**: Supports `@/` alias for `src/`

### Mock Strategy

#### Ethers.js Mocking
All ethers.js functionality is mocked to avoid requiring actual blockchain connections:

```javascript
jest.mock('ethers', () => ({
  ethers: {
    isAddress: jest.fn(),
    getAddress: jest.fn(),
    parseUnits: jest.fn(),
    formatUnits: jest.fn(),
    JsonRpcProvider: jest.fn(),
    Contract: jest.fn(),
    Wallet: jest.fn(),
  },
}));
```

#### Global Mocks
The `jest.setup.js` file provides:
- Mock transaction objects
- Mock contract interfaces
- Mock wallet instances
- Console spy utilities

## Test Categories

### 1. Unit Tests - Utilities (`utils.test.js`)

Tests all utility functions including:

#### Address Validation
- `validateAddress()` - Ethereum address format validation
- `formatAddress()` - Address checksum formatting

#### Amount Validation and Conversion
- `validateAmount()` - Positive number validation
- `validateNonNegativeAmount()` - Non-negative number validation
- `formatAmountToWei()` - Token units to wei conversion
- `formatAmountFromWei()` - Wei to token units conversion

#### API Response Handling
- `createApiResponse()` - Standardized response creation
- `handleApiError()` - Error response formatting
- `validateRequiredFields()` - Request body validation

#### Transaction Utilities
- `estimateGas()` - Gas estimation for transactions
- `waitForTransaction()` - Transaction confirmation waiting
- `formatTransactionResult()` - Transaction receipt formatting

#### Security Utilities
- `validatePrivateKey()` - Private key format validation
- `sanitizePrivateKey()` - Private key sanitization for logging

**Example Test:**
```javascript
describe('validateAddress', () => {
  it('should return true for valid address', () => {
    ethers.isAddress.mockReturnValue(true);
    expect(validateAddress('0x1234567890123456789012345678901234567890')).toBe(true);
  });

  it('should return false for invalid address', () => {
    ethers.isAddress.mockReturnValue(false);
    expect(validateAddress('invalid-address')).toBe(false);
  });
});
```

### 2. Unit Tests - DSC Service (`dsc.test.js`)

Tests the DSC token service class:

#### Constructor and Initialization
- Provider setup
- Contract initialization
- Environment variable usage
- Error handling during initialization

#### Read Operations
- `getTokenName()`, `getTokenSymbol()`, `getTokenDecimals()`
- `getTotalSupply()`, `getBalance()`, `getAllowance()`
- `getOwner()`

#### Write Operations (requires signer)
- `mintTokens()` - Token minting
- `burnTokens()` - Token burning
- `approve()` - Allowance approval
- `transfer()` - Token transfers
- `renounceOwnership()` - Ownership renunciation

#### Signer Management
- `setSigner()` - Private key validation and wallet setup
- Error handling for invalid private keys

**Example Test:**
```javascript
describe('mintTokens', () => {
  it('should mint tokens successfully', async () => {
    const to = '0x1111111111111111111111111111111111111111';
    const amount = '100';
    mockContract.mint.mockResolvedValue(global.mockTransaction);
    
    const result = await dscService.mintTokens(to, amount);
    expect(mockContract.mint).toHaveBeenCalledWith(to, BigInt(amount));
    expect(result).toBeDefined();
  });

  it('should throw error if no signer set', async () => {
    dscService.signer = null;
    
    await expect(dscService.mintTokens('0x123', '100')).rejects.toThrow(
      'Signer not set. Private key required for minting.'
    );
  });
});
```

### 3. Unit Tests - DSC Engine Service (`dscEngine.test.js`)

Tests the DSC Engine service class:

#### Constructor and Initialization
- Contract setup with provider
- Error handling

#### Read Operations
- `getAccountInformation()` - User account data
- `getHealthFactor()` - Position health calculation
- `getAccountCollateralValued()` - Total collateral value
- `getCollateralBalanceOfUser()` - Specific token balance
- `getCollateralTokens()` - Supported collateral tokens
- `getCollateralTokenPriceFeed()` - Price feed addresses
- `getTokenAmountFromUsd()` - USD to token conversion
- `getUsdValue()` - Token to USD conversion

#### Write Operations
- `depositCollateral()` - Collateral deposits
- `mintDSC()` - DSC token minting
- `depositCollateralAndMintDSC()` - Combined deposit and mint
- `redeemCollateral()` - Collateral withdrawal
- `burnDSC()` - DSC token burning
- `redeemCollateralForDSC()` - Combined redeem and burn
- `liquidate()` - Position liquidation

### 4. API Tests - Status Endpoint (`status.test.js`)

Tests the status endpoint functionality:

#### Response Structure
- API status information
- Endpoint documentation
- Contract addresses
- Usage examples
- Technical specifications

#### Validation
- Timestamp format validation
- Complete endpoint listing
- Contract address format verification

### 5. API Tests - Token Endpoints (`token-api.test.js`)

Comprehensive tests for all token API endpoints:

#### GET Endpoints
- `/api/token/info` - Token information
- `/api/token/balance` - Balance queries
- `/api/token/allowance` - Allowance queries

#### POST Endpoints
- `/api/token/mint` - Token minting
- `/api/token/burn` - Token burning
- `/api/token/transfer` - Token transfers
- `/api/token/approve` - Allowance approvals

#### Error Handling
- Missing parameters
- Invalid address formats
- Invalid amounts
- Service errors

**Example Test:**
```javascript
describe('GET /api/token/balance', () => {
  it('should return balance for valid address', async () => {
    const testAddress = '0x1234567890123456789012345678901234567890';
    mockDscService.getBalance.mockResolvedValue('100.5');
    mockDscService.getTokenSymbol.mockResolvedValue('DSC');

    await getBalance(mockRequest);

    expect(mockUtils.validateAddress).toHaveBeenCalledWith(testAddress);
    expect(mockDscService.getBalance).toHaveBeenCalledWith(testAddress);
    expect(mockUtils.createApiResponse).toHaveBeenCalledWith(true, {
      address: testAddress,
      balance: '100.5',
      symbol: 'DSC'
    });
  });
});
```

### 6. API Tests - Engine Endpoints (`engine-api.test.js`)

Comprehensive tests for all engine API endpoints:

#### GET Endpoints
- `/api/engine/account` - Account information
- `/api/engine/collateral` - Collateral information (with/without token parameter)

#### POST Endpoints
- `/api/engine/deposit` - Collateral deposits
- `/api/engine/mint` - DSC minting
- `/api/engine/deposit-and-mint` - Combined operations
- `/api/engine/redeem` - Collateral redemption
- `/api/engine/burn` - DSC burning
- `/api/engine/redeem-and-burn` - Combined operations
- `/api/engine/liquidate` - Position liquidation

### 7. Integration Tests (`integration.test.js`)

End-to-end testing of complete API workflows:

#### Test Setup
- Next.js app initialization
- HTTP server creation
- Complete mock setup

#### Status Endpoint Integration
- Full status response validation
- Documentation completeness

#### Token API Integration
- Complete read/write operation flows
- Error scenarios
- Parameter validation

#### Engine API Integration
- Account management workflows
- Collateral operations
- Liquidation scenarios

#### Complete Workflows
- Deposit → Mint → Check Balance flow
- Multi-step transaction validation
- State verification between operations

**Example Integration Test:**
```javascript
describe('Complete Workflow', () => {
  it('should handle a complete deposit and mint workflow', async () => {
    // 1. Check initial account state
    const accountBefore = await app
      .get(`/api/engine/account?user=${userAddress}`)
      .expect(200);

    // 2. Deposit collateral and mint DSC
    const depositMint = await app
      .post('/api/engine/deposit-and-mint')
      .send({
        tokenCollateralAddress: tokenAddress,
        amountCollateral: '200',
        amountDscToMint: '100',
        privateKey: privateKey
      })
      .expect(200);

    // 3. Check account state after operations
    const accountAfter = await app
      .get(`/api/engine/account?user=${userAddress}`)
      .expect(200);

    // 4. Verify changes
    expect(accountAfter.body.data).toHaveProperty('healthFactor');
  });
});
```

## Running Tests

### Available Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test suites
npm run test:utils      # Utility tests only
npm run test:dsc        # DSC service tests only
npm run test:engine     # DSC Engine tests only
npm run test:api        # API tests only

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

### Test Coverage

The test suite aims for comprehensive coverage:

- **Functions**: 90%+ coverage
- **Lines**: 85%+ coverage
- **Branches**: 80%+ coverage
- **Statements**: 85%+ coverage

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

## Mock Data and Fixtures

### Common Test Data

```javascript
const testAddresses = {
  user: '0x1234567890123456789012345678901234567890',
  token: '0x1111111111111111111111111111111111111111',
  spender: '0x2222222222222222222222222222222222222222'
};

const testAmounts = {
  collateral: '100',
  dsc: '50',
  balance: '75.5'
};

const testTransaction = {
  hash: '0xabc123',
  blockNumber: 12345,
  gasUsed: '150000',
  status: 1,
  confirmations: 1
};
```

### Mock Contract Responses

All contract methods return predictable mock data for consistent testing:

- `balanceOf()` → `BigInt('100000000000000000000')` (100 tokens)
- `totalSupply()` → `BigInt('1000000000000000000000')` (1000 tokens)
- `getHealthFactor()` → `BigInt('2000000000000000000')` (2.0 health factor)

## Best Practices

### Test Organization
1. **Describe blocks**: Group related tests logically
2. **Clear naming**: Test names describe expected behavior
3. **Setup/Teardown**: Use `beforeEach`/`afterEach` for clean state
4. **Async handling**: Proper `async/await` usage

### Mocking Strategy
1. **Minimal mocking**: Only mock external dependencies
2. **Consistent mocks**: Use global mocks for shared dependencies
3. **Mock verification**: Verify mock calls and arguments
4. **Error scenarios**: Test both success and failure paths

### Assertion Patterns
1. **Specific assertions**: Test exact expected values
2. **Property validation**: Verify object structure
3. **Error validation**: Check error messages and types
4. **State verification**: Confirm state changes

### Performance
1. **Parallel execution**: Tests run in parallel by default
2. **Fast mocks**: In-memory mocks avoid I/O
3. **Timeout handling**: Appropriate timeouts for async operations
4. **Resource cleanup**: Proper cleanup in integration tests

## Debugging Tests

### Common Issues

1. **Mock not working**: Check mock setup in `jest.setup.js`
2. **Async issues**: Ensure proper `await` usage
3. **Import errors**: Verify module paths and mocking
4. **State pollution**: Clear mocks between tests

### Debug Tools

```bash
# Run specific test file
npm test -- utils.test.js

# Run with verbose output
npm test -- --verbose

# Run single test
npm test -- --testNamePattern="should validate address"

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Contributing to Tests

### Adding New Tests

1. **Follow naming conventions**: `*.test.js` for unit tests
2. **Use existing patterns**: Follow established test structure
3. **Update mocks**: Add new mocks to `jest.setup.js` if needed
4. **Document complex tests**: Add comments for complex test logic

### Test Requirements

- All new functions must have unit tests
- API endpoints must have integration tests
- Error scenarios must be tested
- Edge cases should be covered
- Mock data should be realistic

This test suite ensures the DSC backend is reliable, maintainable, and functions correctly across all components and integration points. 