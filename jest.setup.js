import '@testing-library/jest-dom';

// Mock ethers.js
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

// Mock environment variables, anvil rpc url
process.env.BLOCKCHAIN_RPC_URL = 'http://localhost:8545';

// Global test utilities
global.mockTransaction = {
  hash: '0x1234567890abcdef',
  wait: jest.fn().mockResolvedValue({
    hash: '0x1234567890abcdef',
    blockNumber: 12345,
    gasUsed: { toString: () => '21000' },
    status: 1,
    confirmations: 1,
  }),
};

global.mockProvider = {
  getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
};

global.mockContract = {
  name: jest.fn(),
  symbol: jest.fn(),
  decimals: jest.fn(),
  totalSupply: jest.fn(),
  balanceOf: jest.fn(),
  allowance: jest.fn(),
  owner: jest.fn(),
  mint: jest.fn(),
  burn: jest.fn(),
  approve: jest.fn(),
  transfer: jest.fn(),
  renounceOwnership: jest.fn(),
  getAccountInformation: jest.fn(),
  getHealthFactor: jest.fn(),
  getAccountCollateralValued: jest.fn(),
  getCollateralBalanceOfUser: jest.fn(),
  getCollateralTokens: jest.fn(),
  getCollateralTokenPriceFeed: jest.fn(),
  getTokenAmountFromUsd: jest.fn(),
  getUsdValue: jest.fn(),
  depositCollateral: jest.fn(),
  mintDSC: jest.fn(),
  depositCollateralAndMintDSC: jest.fn(),
  redeemCollateral: jest.fn(),
  burnDSC: jest.fn(),
  redeemCollateralForDSC: jest.fn(),
  liquidate: jest.fn(),
  connect: jest.fn().mockReturnThis(),
};

global.mockWallet = {
  address: '0x1234567890123456789012345678901234567890',
  connect: jest.fn(),
};

// Setup console spy to reduce noise in tests
global.consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
global.consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
}); 