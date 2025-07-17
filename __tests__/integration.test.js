import request from 'supertest';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

// Mock ethers.js for integration tests
jest.mock('ethers', () => ({
  ethers: {
    isAddress: jest.fn().mockReturnValue(true),
    getAddress: jest.fn().mockImplementation(addr => addr),
    parseUnits: jest.fn().mockImplementation(val => BigInt(val) * BigInt('1000000000000000000')),
    formatUnits: jest.fn().mockImplementation(val => (Number(val) / 1e18).toString()),
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 })
    })),
    Contract: jest.fn().mockImplementation(() => ({
      name: jest.fn().mockResolvedValue('DecentralizedStableCoin'),
      symbol: jest.fn().mockResolvedValue('DSC'),
      decimals: jest.fn().mockResolvedValue(18),
      totalSupply: jest.fn().mockResolvedValue(BigInt('1000000000000000000000')),
      balanceOf: jest.fn().mockResolvedValue(BigInt('100000000000000000000')),
      allowance: jest.fn().mockResolvedValue(BigInt('50000000000000000000')),
      owner: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      mint: jest.fn().mockResolvedValue({
        hash: '0xabc123',
        wait: jest.fn().mockResolvedValue({
          hash: '0xabc123',
          blockNumber: 12345,
          gasUsed: { toString: () => '150000' },
          status: 1,
          confirmations: 1
        })
      }),
      burn: jest.fn().mockResolvedValue({
        hash: '0xdef456',
        wait: jest.fn().mockResolvedValue({
          hash: '0xdef456',
          blockNumber: 12346,
          gasUsed: { toString: () => '120000' },
          status: 1,
          confirmations: 1
        })
      }),
      approve: jest.fn().mockResolvedValue({
        hash: '0x789abc',
        wait: jest.fn().mockResolvedValue({
          hash: '0x789abc',
          blockNumber: 12347,
          gasUsed: { toString: () => '80000' },
          status: 1,
          confirmations: 1
        })
      }),
      transfer: jest.fn().mockResolvedValue({
        hash: '0x456def',
        wait: jest.fn().mockResolvedValue({
          hash: '0x456def',
          blockNumber: 12348,
          gasUsed: { toString: () => '65000' },
          status: 1,
          confirmations: 1
        })
      }),
      getAccountInformation: jest.fn().mockResolvedValue([
        BigInt('50000000000000000000'), // totalDscMinted
        BigInt('100000000000000000000') // collateralValueInUsd
      ]),
      getHealthFactor: jest.fn().mockResolvedValue(BigInt('2000000000000000000')), // 2.0
      getAccountCollateralValued: jest.fn().mockResolvedValue(BigInt('150000000000000000000')),
      getCollateralBalanceOfUser: jest.fn().mockResolvedValue(BigInt('75000000000000000000')),
      getCollateralTokens: jest.fn().mockResolvedValue([
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222'
      ]),
      getCollateralTokenPriceFeed: jest.fn().mockResolvedValue('0x3333333333333333333333333333333333333333'),
      depositCollateral: jest.fn().mockResolvedValue({
        hash: '0x123abc',
        wait: jest.fn().mockResolvedValue({
          hash: '0x123abc',
          blockNumber: 12349,
          gasUsed: { toString: () => '200000' },
          status: 1,
          confirmations: 1
        })
      }),
      mintDSC: jest.fn().mockResolvedValue({
        hash: '0x321cba',
        wait: jest.fn().mockResolvedValue({
          hash: '0x321cba',
          blockNumber: 12350,
          gasUsed: { toString: () => '180000' },
          status: 1,
          confirmations: 1
        })
      }),
      depositCollateralAndMintDSC: jest.fn().mockResolvedValue({
        hash: '0x654fed',
        wait: jest.fn().mockResolvedValue({
          hash: '0x654fed',
          blockNumber: 12351,
          gasUsed: { toString: () => '350000' },
          status: 1,
          confirmations: 1
        })
      }),
      redeemCollateral: jest.fn().mockResolvedValue({
        hash: '0x987zyx',
        wait: jest.fn().mockResolvedValue({
          hash: '0x987zyx',
          blockNumber: 12352,
          gasUsed: { toString: () => '250000' },
          status: 1,
          confirmations: 1
        })
      }),
      burnDSC: jest.fn().mockResolvedValue({
        hash: '0x147asd',
        wait: jest.fn().mockResolvedValue({
          hash: '0x147asd',
          blockNumber: 12353,
          gasUsed: { toString: () => '110000' },
          status: 1,
          confirmations: 1
        })
      }),
      redeemCollateralForDSC: jest.fn().mockResolvedValue({
        hash: '0x258qwe',
        wait: jest.fn().mockResolvedValue({
          hash: '0x258qwe',
          blockNumber: 12354,
          gasUsed: { toString: () => '300000' },
          status: 1,
          confirmations: 1
        })
      }),
      liquidate: jest.fn().mockResolvedValue({
        hash: '0x369zxc',
        wait: jest.fn().mockResolvedValue({
          hash: '0x369zxc',
          blockNumber: 12355,
          gasUsed: { toString: () => '400000' },
          status: 1,
          confirmations: 1
        })
      }),
      connect: jest.fn().mockReturnThis()
    })),
    Wallet: jest.fn().mockImplementation(() => ({
      address: '0x1234567890123456789012345678901234567890',
      connect: jest.fn()
    }))
  }
}));

// Mock ABI constants
jest.mock('../src/lib/abi/abi_constants.js', () => ({
  dscAddress: '0x1234567890123456789012345678901234567890',
  dscAbi: [],
  dscEngineAddress: '0x2345678901234567890123456789012345678901',
  dscEngineAbi: []
}));

describe('API Integration Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Create Next.js app for testing
    const nextApp = next({ dev: false, dir: __dirname + '/../' });
    const handle = nextApp.getRequestHandler();
    
    await nextApp.prepare();
    
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });
    
    app = request(server);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Status Endpoint', () => {
    it('should return API status and documentation', async () => {
      const response = await app
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body).toHaveProperty('contracts');
      expect(response.body).toHaveProperty('examples');
      
      // Verify endpoint documentation structure
      expect(response.body.endpoints.token).toHaveProperty('read');
      expect(response.body.endpoints.token).toHaveProperty('write');
      expect(response.body.endpoints.engine).toHaveProperty('read');
      expect(response.body.endpoints.engine).toHaveProperty('write');
    });
  });

  describe('Token API Integration', () => {
    const testAddress = '0x1234567890123456789012345678901234567890';
    const privateKey = '0x' + 'a'.repeat(64);

    describe('Read Operations', () => {
      it('should get token information', async () => {
        const response = await app
          .get('/api/token/info')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('name', 'DecentralizedStableCoin');
        expect(response.body.data).toHaveProperty('symbol', 'DSC');
        expect(response.body.data).toHaveProperty('decimals', 18);
        expect(response.body.data).toHaveProperty('totalSupply');
        expect(response.body.data).toHaveProperty('owner');
      });

      it('should get token balance for address', async () => {
        const response = await app
          .get(`/api/token/balance?address=${testAddress}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('address', testAddress);
        expect(response.body.data).toHaveProperty('balance');
        expect(response.body.data).toHaveProperty('symbol', 'DSC');
      });

      it('should get allowance between addresses', async () => {
        const spender = '0x2222222222222222222222222222222222222222';
        const response = await app
          .get(`/api/token/allowance?owner=${testAddress}&spender=${spender}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('owner', testAddress);
        expect(response.body.data).toHaveProperty('spender', spender);
        expect(response.body.data).toHaveProperty('allowance');
      });

      it('should return error for invalid address format', async () => {
        const response = await app
          .get('/api/token/balance?address=invalid-address')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Invalid Ethereum address format');
      });

      it('should return error for missing required parameters', async () => {
        const response = await app
          .get('/api/token/balance')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Address parameter is required');
      });
    });

    describe('Write Operations', () => {
      it('should mint tokens successfully', async () => {
        const response = await app
          .post('/api/token/mint')
          .send({
            to: testAddress,
            amount: '100',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
        expect(response.body.data).toHaveProperty('blockNumber');
        expect(response.body.data).toHaveProperty('gasUsed');
      });

      it('should burn tokens successfully', async () => {
        const response = await app
          .post('/api/token/burn')
          .send({
            amount: '50',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
      });

      it('should approve spender successfully', async () => {
        const response = await app
          .post('/api/token/approve')
          .send({
            spender: '0x2222222222222222222222222222222222222222',
            amount: '200',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
      });

      it('should transfer tokens successfully', async () => {
        const response = await app
          .post('/api/token/transfer')
          .send({
            to: '0x3333333333333333333333333333333333333333',
            amount: '75',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
      });

      it('should return error for missing required fields', async () => {
        const response = await app
          .post('/api/token/mint')
          .send({
            to: testAddress,
            amount: '100'
            // missing privateKey
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('privateKey is required');
      });
    });
  });

  describe('Engine API Integration', () => {
    const testUser = '0x1234567890123456789012345678901234567890';
    const testToken = '0x1111111111111111111111111111111111111111';
    const privateKey = '0x' + 'a'.repeat(64);

    describe('Read Operations', () => {
      it('should get account information', async () => {
        const response = await app
          .get(`/api/engine/account?user=${testUser}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('user', testUser);
        expect(response.body.data).toHaveProperty('totalDscMinted');
        expect(response.body.data).toHaveProperty('collateralValueInUsd');
        expect(response.body.data).toHaveProperty('healthFactor');
        expect(response.body.data).toHaveProperty('totalCollateralValueInUsd');
      });

      it('should get collateral tokens', async () => {
        const response = await app
          .get(`/api/engine/collateral?user=${testUser}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('user', testUser);
        expect(response.body.data).toHaveProperty('collateralTokens');
        expect(Array.isArray(response.body.data.collateralTokens)).toBe(true);
      });

      it('should get specific token collateral information', async () => {
        const response = await app
          .get(`/api/engine/collateral?user=${testUser}&token=${testToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('user', testUser);
        expect(response.body.data).toHaveProperty('token', testToken);
        expect(response.body.data).toHaveProperty('balance');
        expect(response.body.data).toHaveProperty('priceFeed');
      });
    });

    describe('Write Operations', () => {
      it('should deposit collateral successfully', async () => {
        const response = await app
          .post('/api/engine/deposit')
          .send({
            tokenCollateralAddress: testToken,
            amountCollateral: '100',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
        expect(response.body.data).toHaveProperty('gasUsed');
      });

      it('should mint DSC successfully', async () => {
        const response = await app
          .post('/api/engine/mint')
          .send({
            amountDscToMint: '50',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
      });

      it('should deposit and mint in one transaction', async () => {
        const response = await app
          .post('/api/engine/deposit-and-mint')
          .send({
            tokenCollateralAddress: testToken,
            amountCollateral: '200',
            amountDscToMint: '100',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
      });

      it('should redeem collateral successfully', async () => {
        const response = await app
          .post('/api/engine/redeem')
          .send({
            tokenCollateralAddress: testToken,
            amountCollateral: '50',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
      });

      it('should burn DSC successfully', async () => {
        const response = await app
          .post('/api/engine/burn')
          .send({
            amount: '25',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
      });

      it('should redeem and burn in one transaction', async () => {
        const response = await app
          .post('/api/engine/redeem-and-burn')
          .send({
            tokenCollateralAddress: testToken,
            amountCollateral: '75',
            amountDscToBurn: '37.5',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
      });

      it('should liquidate position successfully', async () => {
        const response = await app
          .post('/api/engine/liquidate')
          .send({
            collateral: testToken,
            user: '0x2222222222222222222222222222222222222222',
            debtToCover: '100',
            privateKey: privateKey
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('transactionHash');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await app
        .get('/api/nonexistent')
        .expect(404);
    });

    it('should handle malformed JSON in POST requests', async () => {
      const response = await app
        .post('/api/token/mint')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    it('should validate required fields consistently', async () => {
      const response = await app
        .post('/api/engine/deposit')
        .send({
          tokenCollateralAddress: '0x1111111111111111111111111111111111111111',
          // missing amountCollateral and privateKey
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
  });

  describe('Complete Workflow', () => {
    it('should handle a complete deposit and mint workflow', async () => {
      const userAddress = '0x1234567890123456789012345678901234567890';
      const tokenAddress = '0x1111111111111111111111111111111111111111';
      const privateKey = '0x' + 'a'.repeat(64);

      // 1. Check initial account state
      const accountBefore = await app
        .get(`/api/engine/account?user=${userAddress}`)
        .expect(200);

      expect(accountBefore.body.success).toBe(true);

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

      expect(depositMint.body.success).toBe(true);
      expect(depositMint.body.data).toHaveProperty('transactionHash');

      // 3. Check account state after operations
      const accountAfter = await app
        .get(`/api/engine/account?user=${userAddress}`)
        .expect(200);

      expect(accountAfter.body.success).toBe(true);
      expect(accountAfter.body.data).toHaveProperty('healthFactor');

      // 4. Check DSC token balance
      const balance = await app
        .get(`/api/token/balance?address=${userAddress}`)
        .expect(200);

      expect(balance.body.success).toBe(true);
      expect(balance.body.data).toHaveProperty('balance');
    });
  });
}); 