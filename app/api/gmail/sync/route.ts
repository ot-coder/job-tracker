import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { cookies } from 'next/headers'
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

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// Keywords that indicate job application confirmations
const JOB_APPLICATION_KEYWORDS = [
  'thank you for applying',
  'application received',
  'we have received your application',
  'your application for',
  'application confirmation',
  'thank you for your interest',
  'we received your application',
  'application submitted successfully',
  'your resume has been received',
  'thank you for submitting'
]

// Keywords that indicate rejections
const REJECTION_KEYWORDS = [
  'unfortunately',
  'we regret to inform',
  'not selected',
  'decided to move forward with other candidates',
  'will not be moving forward',
  'thank you for your interest, however',
  'we have decided not to proceed',
  'position has been filled'
]

// Keywords that indicate interview invitations
const INTERVIEW_KEYWORDS = [
  'interview',
  'would like to schedule',
  'next step in the process',
  'phone screen',
  'video call',
  'meet with our team',
  'discuss your application further'
]

export async function POST() {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('gmail_access_token')
    const refreshToken = cookieStore.get('gmail_refresh_token')

    if (!accessToken?.value) {
      return NextResponse.json({ error: 'Not authenticated with Gmail' }, { status: 401 })
    }

    oauth2Client.setCredentials({
      access_token: accessToken.value,
      refresh_token: refreshToken?.value
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Search for emails from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const query = `after:${Math.floor(thirtyDaysAgo.getTime() / 1000)}`

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100
    })

    const messages = response.data.messages || []
    let newApplications = 0

    for (const message of messages) {
      try {
        const messageData = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!
        })

        const headers = messageData.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || ''
        const from = headers.find(h => h.name === 'From')?.value || ''
        const date = headers.find(h => h.name === 'Date')?.value || ''

        // Get email body
        let body = ''
        if (messageData.data.payload?.body?.data) {
          body = Buffer.from(messageData.data.payload.body.data, 'base64').toString()
        } else if (messageData.data.payload?.parts) {
          for (const part of messageData.data.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString()
            }
          }
        }

        const fullText = `${subject} ${body}`.toLowerCase()

        // Check if this looks like a job application email
        const isJobApplication = JOB_APPLICATION_KEYWORDS.some(keyword => 
          fullText.includes(keyword.toLowerCase())
        )

        if (isJobApplication) {
          // Check if we already have this email
          const existingApp = await db.collection('applications')
            .where('emailId', '==', message.id)
            .get()

          if (existingApp.empty) {
            // Extract company name from email domain or sender
            let company = 'Unknown Company'
            const emailMatch = from.match(/<(.+)>/)
            if (emailMatch) {
              const domain = emailMatch[1].split('@')[1]
              company = domain.split('.')[0]
              company = company.charAt(0).toUpperCase() + company.slice(1)
            }

            // Extract position from subject if possible
            let position = 'Unknown Position'
            const positionMatch = subject.match(/for\s+(.+?)\s+(position|role)/i)
            if (positionMatch) {
              position = positionMatch[1]
            }

            // Determine status based on email content
            let status = 'applied'
            if (REJECTION_KEYWORDS.some(keyword => fullText.includes(keyword))) {
              status = 'rejected'
            } else if (INTERVIEW_KEYWORDS.some(keyword => fullText.includes(keyword))) {
              status = 'interview'
            }

            // Create new application
            await db.collection('applications').add({
              company,
              position,
              applicationDate: new Date(date).toISOString(),
              status,
              lastUpdate: new Date().toISOString(),
              emailId: message.id,
              notes: `Auto-detected from email: ${subject}`,
              createdAt: new Date().toISOString()
            })

            newApplications++
          }
        }
      } catch (messageError) {
        console.error('Error processing message:', messageError)
        // Continue with next message
      }
    }

    return NextResponse.json({ 
      success: true, 
      newApplications,
      totalMessages: messages.length 
    })
  } catch (error) {
    console.error('Error syncing Gmail:', error)
    return NextResponse.json({ error: 'Failed to sync Gmail' }, { status: 500 })
  }
}
