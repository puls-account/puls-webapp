import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const studyType = searchParams.get('studyType');
    const authorization = request.headers.get('authorization');

    if (!type || !studyType) {
      return NextResponse.json(
        { detail: 'Type and studyType are required' },
        { status: 400 }
      );
    }

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `https://pulscore.org/api/questionnaires/${studyType}/${type}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { detail: 'Failed to fetch questions' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}