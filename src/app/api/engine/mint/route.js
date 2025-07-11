import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';
import { validateAmount, createApiResponse, handleApiError, validateRequiredFields } from '../../../../lib/utils.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amountDscToMint, privateKey } = body;

    // Validate required parameters
    const validationError = validateRequiredFields(body, ['amountDscToMint', 'privateKey']);
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 });
    }

    // Validate amount
    if (!validateAmount(amountDscToMint)) {
      return NextResponse.json(
        createApiResponse(false, null, 'Amount must be a positive number'),
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Mint DSC
    const result = await dscService.dscEngine.mintDSC(amountDscToMint);

    return NextResponse.json({
      success: true,
      data: {
        amountDscToMint,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error minting DSC:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mint DSC',
        details: error.message
      },
      { status: 500 }
    );
  }
} 