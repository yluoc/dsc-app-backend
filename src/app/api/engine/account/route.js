import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, createApiResponse, handleApiError } from '../../../../lib/utils.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user) {
      return NextResponse.json(
        createApiResponse(false, null, 'User address parameter is required'),
        { status: 400 }
      );
    }

    if (!validateAddress(user)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid Ethereum address format'),
        { status: 400 }
      );
    }

    const formattedUser = formatAddress(user);
    const accountInfo = await dscService.dscEngine.getAccountInformation(formattedUser);
    const healthFactor = await dscService.dscEngine.getHealthFactor(formattedUser);
    const collateralValue = await dscService.dscEngine.getAccountCollateralValued(formattedUser);

    return NextResponse.json(
      createApiResponse(true, {
        user: formattedUser,
        totalDscMinted: accountInfo.totalDscMinted,
        collateralValueInUsd: accountInfo.collateralValueInUsd,
        healthFactor,
        totalCollateralValueInUsd: collateralValue
      })
    );
  } catch (error) {
    return NextResponse.json(
      handleApiError(error, 'fetch account information'),
      { status: 500 }
    );
  }
} 