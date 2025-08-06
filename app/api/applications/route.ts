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

export async function GET() {
  try {
    const applicationsRef = db.collection('applications')
    const snapshot = await applicationsRef.orderBy('applicationDate', 'desc').get()

    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Check for applications that should be marked as ghosted
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    for (const app of applications) {
      if (
        app.status === 'applied' &&
        new Date(app.applicationDate) < twoWeeksAgo
      ) {
        await applicationsRef.doc(app.id).update({
          status: 'ghosted',
          lastUpdate: new Date().toISOString()
        })
        app.status = 'ghosted'
        app.lastUpdate = new Date().toISOString()
      }
    }

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const applicationData = {
      ...data,
      lastUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    const docRef = await db.collection('applications').add(applicationData)

    return NextResponse.json({ id: docRef.id, ...applicationData })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}
