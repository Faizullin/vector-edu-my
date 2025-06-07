import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import ApiUtils from '../../../api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Simulate authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Token ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const lessonPageObj = await ApiUtils.findItemById(
      'pages',
      Number(id)
    );

    return NextResponse.json(lessonPageObj, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
