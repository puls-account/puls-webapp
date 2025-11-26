import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const questionnaireId = formData.get('questionnaireId')
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })

    const fileName = `video_${Date.now()}_${questionnaireId}.webm`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET || 'puls-webapp-prod',
      Key: fileName,
      Body: buffer,
      ContentType: 'video/webm',
    }

    const response = await s3Client.send(new PutObjectCommand(uploadParams))
    
    return NextResponse.json({
      success: true,
      response,
      key: fileName,
      message: 'Video uploaded successfully'
    })
  } catch (error) {
    console.error('S3 upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed',
      message: 'Please try again'
    }, { status: 500 })
  }
}