import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')
    
    console.log('Survey results request body:', JSON.stringify(body, null, 2))
    
    const response = await fetch('https://pulscore.org/api/survey_results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify(body),
    })

    const data = await response.text()
    console.log('Backend response:', response.status, data)
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error submitting survey results:', error)
    return NextResponse.json({ error: 'Failed to submit survey results' }, { status: 500 })
  }
}