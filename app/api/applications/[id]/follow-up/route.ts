import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const updateData = {
      status: 'waiting',
      followUpDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      notes: 'Follow-up sent'
    }

    await db.collection('applications').doc(id).update(updateData)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking follow-up:', error)
    return NextResponse.json({ error: 'Failed to mark follow-up' }, { status: 500 })
  }
}
