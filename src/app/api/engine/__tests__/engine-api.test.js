// Mock dependencies first
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock('../../../../lib/dsc.js', () => ({
  default: {
    dscEngine: {
      getAccountInformation: jest.fn(),
      getHealthFactor: jest.fn(),
      getAccountCollateralValued: jest.fn(),
      getCollateralBalanceOfUser: jest.fn(),
      getCollateralTokens: jest.fn(),
      getCollateralTokenPriceFeed: jest.fn(),
      setSigner: jest.fn(),
      depositCollateral: jest.fn(),
      mintDSC: jest.fn(),
      depositCollateralAndMintDSC: jest.fn(),
      redeemCollateral: jest.fn(),
      burnDSC: jest.fn(),
      redeemCollateralForDSC: jest.fn(),
      liquidate: jest.fn(),
    },
  },
}));

jest.mock('../../../../lib/utils.js', () => ({
  validateAddress: jest.fn(),
  formatAddress: jest.fn(),
  validateAmount: jest.fn(),
  createApiResponse: jest.fn(),
  handleApiError: jest.fn(),
  validateRequiredFields: jest.fn(),
}));

describe('Engine API Service Layer Tests', () => {
  let mockDscService;
  let mockDscEngine;
  let mockUtils;
  let NextResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get mocked modules
    mockDscService = require('../../../../lib/dsc.js').default;
    mockDscEngine = mockDscService.dscEngine;
    mockUtils = require('../../../../lib/utils.js');
    NextResponse = require('next/server').NextResponse;

    // Setup default mock implementations
    mockUtils.validateAddress.mockReturnValue(true);
    mockUtils.formatAddress.mockImplementation(addr => addr);
    mockUtils.validateAmount.mockReturnValue(true);
    mockUtils.createApiResponse.mockImplementation((success, data, error) => ({
      success, data, error
    }));
    mockUtils.handleApiError.mockImplementation((error, operation) => ({
      success: false,
      error: `Failed to ${operation}`,
      details: error.message
    }));
    mockUtils.validateRequiredFields.mockReturnValue(null);
    
    NextResponse.json.mockImplementation((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      data
    }));
  });

  describe('Account Information Service', () => {
    it('should get account information', async () => {
      const testUser = '0x1234567890123456789012345678901234567890';
      const mockAccountInfo = {
        totalDscMinted: '100',
        collateralValueInUsd: '200'
      };

      mockDscEngine.getAccountInformation.mockResolvedValue(mockAccountInfo);
      mockDscEngine.getHealthFactor.mockResolvedValue('1.5');
      mockDscEngine.getAccountCollateralValued.mockResolvedValue('250');

      const accountInfo = await mockDscEngine.getAccountInformation(testUser);
      const healthFactor = await mockDscEngine.getHealthFactor(testUser);
      const collateralValue = await mockDscEngine.getAccountCollateralValued(testUser);

      expect(accountInfo).toEqual(mockAccountInfo);
      expect(healthFactor).toBe('1.5');
      expect(collateralValue).toBe('250');
    });
  });

  describe('Collateral Information Service', () => {
    it('should get all collateral tokens', async () => {
      const mockTokens = [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222'
      ];

      mockDscEngine.getCollateralTokens.mockResolvedValue(mockTokens);

      const tokens = await mockDscEngine.getCollateralTokens();
      expect(tokens).toEqual(mockTokens);
    });

    it('should get specific token collateral information', async () => {
      const testUser = '0x1234567890123456789012345678901234567890';
      const testToken = '0x1111111111111111111111111111111111111111';

      mockDscEngine.getCollateralBalanceOfUser.mockResolvedValue('50');
      mockDscEngine.getCollateralTokenPriceFeed.mockResolvedValue('0x3333333333333333333333333333333333333333');

      const balance = await mockDscEngine.getCollateralBalanceOfUser(testUser, testToken);
      const priceFeed = await mockDscEngine.getCollateralTokenPriceFeed(testToken);

      expect(balance).toBe('50');
      expect(priceFeed).toBe('0x3333333333333333333333333333333333333333');
    });
  });

  describe('Engine Operations Service', () => {
    it('should handle collateral deposits', async () => {
      const mockTransactionResult = {
        transactionHash: '0x123',
        blockNumber: 12345,
        gasUsed: '150000'
      };
      mockDscEngine.depositCollateral.mockResolvedValue(mockTransactionResult);

      const result = await mockDscEngine.depositCollateral(
        '0x1111111111111111111111111111111111111111',
        '100'
      );

      expect(result).toEqual(mockTransactionResult);
    });

    it('should handle DSC minting', async () => {
      const mockTransactionResult = {
        transactionHash: '0x456',
        blockNumber: 12346,
        gasUsed: '120000'
      };
      mockDscEngine.mintDSC.mockResolvedValue(mockTransactionResult);

      const result = await mockDscEngine.mintDSC('50');
      expect(result).toEqual(mockTransactionResult);
    });

    it('should handle combined deposit and mint', async () => {
      const mockTransactionResult = {
        transactionHash: '0x789',
        blockNumber: 12347,
        gasUsed: '200000'
      };
      mockDscEngine.depositCollateralAndMintDSC.mockResolvedValue(mockTransactionResult);

      const result = await mockDscEngine.depositCollateralAndMintDSC(
        '0x1111111111111111111111111111111111111111',
        '200',
        '100'
      );
      expect(result).toEqual(mockTransactionResult);
    });

    it('should handle collateral redemption', async () => {
      const mockTransactionResult = {
        transactionHash: '0xabc',
        blockNumber: 12348,
        gasUsed: '180000'
      };
      mockDscEngine.redeemCollateral.mockResolvedValue(mockTransactionResult);

      const result = await mockDscEngine.redeemCollateral(
        '0x1111111111111111111111111111111111111111',
        '50'
      );
      expect(result).toEqual(mockTransactionResult);
    });

    it('should handle DSC burning', async () => {
      const mockTransactionResult = {
        transactionHash: '0xdef',
        blockNumber: 12349,
        gasUsed: '90000'
      };
      mockDscEngine.burnDSC.mockResolvedValue(mockTransactionResult);

      const result = await mockDscEngine.burnDSC('25');
      expect(result).toEqual(mockTransactionResult);
    });

    it('should handle liquidation', async () => {
      const mockTransactionResult = {
        transactionHash: '0xcba',
        blockNumber: 12351,
        gasUsed: '300000'
      };
      mockDscEngine.liquidate.mockResolvedValue(mockTransactionResult);

      const result = await mockDscEngine.liquidate(
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
        '100'
      );
      expect(result).toEqual(mockTransactionResult);
    });
  });
}); 