import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, createApiResponse, handleApiError } from '../../../../lib/utils.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const token = searchParams.get('token');

    // Get all collateral tokens if no specific token provided
    if (!user) {
      return NextResponse.json(
        createApiResponse(false, null, 'User address parameter is required'),
        { status: 400 }
      );
    }

    if (!validateAddress(user)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid user address format'),
        { status: 400 }
      );
    }

    const formattedUser = formatAddress(user);

    if (!token) {
      // Get all collateral tokens
      const collateralTokens = await dscService.dscEngine.getCollateralTokens();
      return NextResponse.json(
        createApiResponse(true, {
          user: formattedUser,
          collateralTokens
        })
      );
    }

    // Get specific token collateral balance
    if (!validateAddress(token)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid token address format'),
        { status: 400 }
      );
    }

    const formattedToken = formatAddress(token);
    const balance = await dscService.dscEngine.getCollateralBalanceOfUser(formattedUser, formattedToken);
    const priceFeed = await dscService.dscEngine.getCollateralTokenPriceFeed(formattedToken);

    return NextResponse.json(
      createApiResponse(true, {
        user: formattedUser,
        token: formattedToken,
        balance,
        priceFeed
      })
    );
  } catch (error) {
    return NextResponse.json(
      handleApiError(error, 'fetch collateral information'),
      { status: 500 }
    );
  }
} 