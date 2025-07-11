import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAmount, createApiResponse, handleApiError, validateRequiredFields } from '../../../../lib/utils.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, privateKey } = body;

    // Validate required parameters
    const validationError = validateRequiredFields(body, ['amount', 'privateKey']);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    // Validate amount
    if (!validateAmount(amount)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Amount must be a positive number'),
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Burn DSC
    const result = await dscService.dscEngine.burnDSC(amount);

    return NextResponse.json({
      success: true,
      data: {
        amount,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error burning DSC:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to burn DSC',
        details: error.message
      },
      { status: 500 }
    );
  }
} 