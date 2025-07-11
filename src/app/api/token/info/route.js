import { NextResponse } from 'next/server';
import dscService from '../../../../lib/dsc.js';

export async function GET() {
  try {
    const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
      dscService.getTokenName(),
      dscService.getTokenSymbol(),
      dscService.getTokenDecimals(),
      dscService.getTotalSupply(),
      dscService.getOwner()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        name,
        symbol,
        decimals: decimals.toString(),
        totalSupply,
        owner,
        contractAddress: process.env.DSC_ADDRESS || '0x2c3B2411D8BEeA449f3dfbdAA80bE8C290a159C3'
      }
    });
  } catch (error) {
    console.error('Error fetching token info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch token information',
        details: error.message
      },
      { status: 500 }
    );
  }
} 