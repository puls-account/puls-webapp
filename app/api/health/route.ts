import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if backend server is reachable
    const response = await fetch('http://52.66.167.211:5005/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => null)

    if (!response || !response.ok) {
      return NextResponse.json({ 
        status: 'backend_unavailable',
        message: 'Backend server is not reachable'
      }, { status: 503 })
    }

    return NextResponse.json({ 
      status: 'healthy',
      message: 'All services are operational'
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Health check failed'
    }, { status: 500 })
  }
}