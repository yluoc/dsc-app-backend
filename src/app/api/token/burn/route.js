import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, privateKey } = body;

    // Validate required parameters
    if (!amount || !privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'amount and privateKey are required'
        },
        { status: 400 }
      );
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Amount must be a positive number'
        },
        { status: 400 }
      );
    }

    // Set signer with private key
    dscService.setSigner(privateKey);

    // Burn tokens
    const result = await dscService.burnTokens(amountNum);

    return NextResponse.json({
      success: true,
      data: {
        amount: amountNum,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error burning tokens:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to burn tokens',
        details: error.message
      },
      { status: 500 }
    );
  }
} 