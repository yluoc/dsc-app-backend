import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, createApiResponse, handleApiError } from '../../../../lib/utils.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    // If no address provided, return general wETH token info
    if (!address) {
      const tokenInfo = {
        name: await dscService.weth.getTokenName(),
        symbol: await dscService.weth.getTokenSymbol(),
        decimals: await dscService.weth.getTokenDecimals(),
        totalSupply: await dscService.weth.getTotalSupply(),
        contractAddress: dscService.weth.contract.target
      };

      return NextResponse.json(
        createApiResponse(true, tokenInfo)
      );
    }

    // Validate address format
    if (!validateAddress(address)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid address format'),
        { status: 400 }
      );
    }

    const formattedAddress = formatAddress(address);

    // Get user-specific information
    const [ethBalance, wethBalance, tokenName, tokenSymbol, decimals] = await Promise.all([
      dscService.weth.getETHBalance(formattedAddress),
      dscService.weth.getBalance(formattedAddress),
      dscService.weth.getTokenName(),
      dscService.weth.getTokenSymbol(),
      dscService.weth.getTokenDecimals()
    ]);

    const userInfo = {
      userAddress: formattedAddress,
      balances: {
        eth: ethBalance,
        weth: wethBalance
      },
      token: {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: decimals,
        contractAddress: dscService.weth.contract.target
      }
    };

    return NextResponse.json(
      createApiResponse(true, userInfo)
    );
  } catch (error) {
    return NextResponse.json(
      handleApiError(error, 'fetch wETH information'),
      { status: 500 }
    );
  }
} 