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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()
    
    const updateData = {
      ...data,
      lastUpdate: new Date().toISOString()
    }

    await db.collection('applications').doc(id).update(updateData)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await db.collection('applications').doc(id).delete()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 })
  }
}
