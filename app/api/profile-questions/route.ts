import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('survey_id');
    const authorization = request.headers.get('authorization');

    if (!surveyId) {
      return NextResponse.json(
        { detail: 'Survey ID is required' },
        { status: 400 }
      );
    }

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header is required' },
        { status: 401 }
      );
    }

    console.log('Fetching profile questions for survey_id:', surveyId);
    console.log('Using token:', authorization ? 'Present' : 'Missing');

    const response = await fetch(
      `https://pulscore.org/api/profile_questions/${surveyId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Profile questions response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Profile questions error:', errorText);
      return NextResponse.json(
        { detail: 'Failed to fetch profile questions' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Profile questions API error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}