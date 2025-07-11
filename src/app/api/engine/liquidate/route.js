import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAddress, formatAddress, validateAmount, createApiResponse, handleApiError, validateRequiredFields } from '../../../../lib/utils.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { collateral, user, debtToCover, privateKey } = body;

    // Validate required parameters
    const validationError = validateRequiredFields(body, ['collateral', 'user', 'debtToCover', 'privateKey']);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    // Validate address formats
    if (!validateAddress(collateral)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid collateral token address format'),
        { status: 400 }
      );
    }

    if (!validateAddress(user)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Invalid user address format'),
        { status: 400 }
      );
    }

    // Validate amount
    if (!validateAmount(debtToCover)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Debt to cover must be a positive number'),
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Format addresses
    const formattedCollateral = formatAddress(collateral);
    const formattedUser = formatAddress(user);

    // Liquidate position
    const result = await dscService.dscEngine.liquidate(formattedCollateral, formattedUser, debtToCover);

    return NextResponse.json({
      success: true,
      data: {
        collateral: formattedCollateral,
        user: formattedUser,
        debtToCover,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error liquidating position:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to liquidate position',
        details: error.message
      },
      { status: 500 }
    );
  }
} 