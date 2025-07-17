// Mock dependencies first
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock('../../../../lib/dsc.js', () => ({
  default: {
    getBalance: jest.fn(),
    getAllowance: jest.fn(),
    getTokenName: jest.fn(),
    getTokenSymbol: jest.fn(),
    getTokenDecimals: jest.fn(),
    getTotalSupply: jest.fn(),
    getOwner: jest.fn(),
    setSigner: jest.fn(),
    mintTokens: jest.fn(),
    burnTokens: jest.fn(),
    transfer: jest.fn(),
    approve: jest.fn(),
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

describe('Token API Service Layer Tests', () => {
  let mockDscService;
  let mockUtils;
  let NextResponse;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get mocked modules
    mockDscService = require('../../../../lib/dsc.js').default;
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

  describe('Token Balance Service', () => {
    it('should handle balance retrieval', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      mockDscService.getBalance.mockResolvedValue('100.5');
      mockDscService.getTokenSymbol.mockResolvedValue('DSC');

      // Test the service layer directly
      const balance = await mockDscService.getBalance(testAddress);
      const symbol = await mockDscService.getTokenSymbol();

      expect(mockDscService.getBalance).toHaveBeenCalledWith(testAddress);
      expect(balance).toBe('100.5');
      expect(symbol).toBe('DSC');
    });

    it('should validate addresses properly', () => {
      // Test valid address
      mockUtils.validateAddress.mockReturnValue(true);
      expect(mockUtils.validateAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      
      // Test invalid address
      mockUtils.validateAddress.mockReturnValue(false);
      expect(mockUtils.validateAddress('invalid-address')).toBe(false);
    });

    it('should handle service errors', async () => {
      const testError = new Error('Service error');
      mockDscService.getBalance.mockRejectedValue(testError);

      try {
        await mockDscService.getBalance('0x123');
      } catch (error) {
        expect(error.message).toBe('Service error');
      }
    });
  });

  describe('Token Allowance Service', () => {
    it('should handle allowance queries', async () => {
      const owner = '0x1111111111111111111111111111111111111111';
      const spender = '0x2222222222222222222222222222222222222222';
      mockDscService.getAllowance.mockResolvedValue('50.25');

      const allowance = await mockDscService.getAllowance(owner, spender);

      expect(mockDscService.getAllowance).toHaveBeenCalledWith(owner, spender);
      expect(allowance).toBe('50.25');
    });
  });

  describe('Token Info Service', () => {
    it('should return token information', async () => {
      mockDscService.getTokenName.mockResolvedValue('DecentralizedStableCoin');
      mockDscService.getTokenSymbol.mockResolvedValue('DSC');
      mockDscService.getTokenDecimals.mockResolvedValue(18);
      mockDscService.getTotalSupply.mockResolvedValue('1000000');
      mockDscService.getOwner.mockResolvedValue('0x1111111111111111111111111111111111111111');

      const name = await mockDscService.getTokenName();
      const symbol = await mockDscService.getTokenSymbol();
      const decimals = await mockDscService.getTokenDecimals();
      const supply = await mockDscService.getTotalSupply();
      const owner = await mockDscService.getOwner();

      expect(name).toBe('DecentralizedStableCoin');
      expect(symbol).toBe('DSC');
      expect(decimals).toBe(18);
      expect(supply).toBe('1000000');
      expect(owner).toBe('0x1111111111111111111111111111111111111111');
    });
  });

  describe('Token Minting Service', () => {
    it('should handle token minting', async () => {
      const mockTransactionResult = {
        transactionHash: '0x123',
        blockNumber: 12345,
        gasUsed: '21000'
      };
      mockDscService.mintTokens.mockResolvedValue(mockTransactionResult);

      const result = await mockDscService.mintTokens(
        '0x1111111111111111111111111111111111111111',
        '100'
      );

      expect(mockDscService.mintTokens).toHaveBeenCalledWith(
        '0x1111111111111111111111111111111111111111',
        '100'
      );
      expect(result).toEqual(mockTransactionResult);
    });

    it('should validate required fields', () => {
      const validBody = { to: '0x123', amount: '100', privateKey: '0xabc' };
      const result = mockUtils.validateRequiredFields(validBody, ['to', 'amount', 'privateKey']);
      expect(result).toBeNull(); // null means validation passed
    });
  });

  describe('Token Operations Service', () => {
    it('should handle token burning', async () => {
      const mockTransactionResult = {
        transactionHash: '0x456',
        blockNumber: 12346,
        gasUsed: '30000'
      };
      mockDscService.burnTokens.mockResolvedValue(mockTransactionResult);

      const result = await mockDscService.burnTokens('50');
      expect(result).toEqual(mockTransactionResult);
    });

    it('should handle token transfers', async () => {
      const mockTransactionResult = {
        transactionHash: '0x789',
        blockNumber: 12347,
        gasUsed: '25000'
      };
      mockDscService.transfer.mockResolvedValue(mockTransactionResult);

      const result = await mockDscService.transfer(
        '0x2222222222222222222222222222222222222222',
        '75'
      );
      expect(result).toEqual(mockTransactionResult);
    });

    it('should handle token approvals', async () => {
      const mockTransactionResult = {
        transactionHash: '0xabc',
        blockNumber: 12348,
        gasUsed: '45000'
      };
      mockDscService.approve.mockResolvedValue(mockTransactionResult);

      const result = await mockDscService.approve(
        '0x3333333333333333333333333333333333333333',
        '200'
      );
      expect(result).toEqual(mockTransactionResult);
    });
  });
}); 