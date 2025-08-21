'use client'

import { useState, useEffect } from 'react'
import { Plus, Mail, Clock, CheckCircle, XCircle, MessageSquare, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApplicationForm } from '@/components/application-form'
import { GmailSync } from '@/components/gmail-sync'
import { ApplicationCard } from '@/components/application-card'
import { StatsOverview } from '@/components/stats-overview'

interface Application {
  id: string
  company: string
  position: string
  applicationDate: string
  status: 'applied' | 'rejected' | 'interview' | 'waiting' | 'ghosted' | 'offer'
  lastUpdate: string
  notes?: string
  emailId?: string
  followUpDate?: string
}

export default function JobTracker() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)

  useEffect(() => {
    loadApplications()
    checkGmailConnection()
  }, [])

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkGmailConnection = async () => {
    try {
      const response = await fetch('/api/gmail/status')
      if (response.ok) {
        const data = await response.json()
        setGmailConnected(data.connected)
      }
    } catch (error) {
      console.error('Error checking Gmail connection:', error)
    }
  }

  const handleAddApplication = async (applicationData: Omit<Application, 'id' | 'lastUpdate'>) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      })

      if (response.ok) {
        await loadApplications()
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding application:', error)
    }
  }

  const handleUpdateStatus = async (id: string, status: Application['status'], notes?: string) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      })

      if (response.ok) {
        await loadApplications()
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const handleFollowUp = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/${id}/follow-up`, {
        method: 'POST'
      })

      if (response.ok) {
        await loadApplications()
      }
    } catch (error) {
      console.error('Error marking follow-up:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Mail className="w-4 h-4" />
      case 'waiting': return <Clock className="w-4 h-4" />
      case 'interview': return <MessageSquare className="w-4 h-4" />
      case 'offer': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'ghosted': return <AlertTriangle className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'interview': return 'bg-purple-100 text-purple-800'
      case 'offer': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'ghosted': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filterApplications = (status?: string) => {
    if (!status) return applications
    return applications.filter(app => app.status === status)
  }

  const ghostedApplications = applications.filter(app => app.status === 'ghosted')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Application Tracker</h1>
              <p className="text-gray-600 mt-2">Track and manage your job applications in one place</p>
            </div>
            <div className="flex gap-3">
              <GmailSync
                connected={gmailConnected}
                onSync={loadApplications}
                onConnectionChange={setGmailConnected}
              />
              <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Application
              </Button>
            </div>
          </div>

          <StatsOverview applications={applications} />
        </div>

        {/* Ghosted Applications Alert */}
        {ghostedApplications.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Follow-up Needed ({ghostedApplications.length})
              </CardTitle>
              <CardDescription className="text-orange-700">
                These applications haven't received a response in over 2 weeks. Consider following up.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {ghostedApplications.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium">{app.position} at {app.company}</p>
                      <p className="text-sm text-gray-600">Applied {new Date(app.applicationDate).toLocaleDateString()}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFollowUp(app.id)}
                    >
                      Mark as Followed Up
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="applied">Applied ({filterApplications('applied').length})</TabsTrigger>
            <TabsTrigger value="waiting">Waiting ({filterApplications('waiting').length})</TabsTrigger>
            <TabsTrigger value="interview">Interview ({filterApplications('interview').length})</TabsTrigger>
            <TabsTrigger value="offer">Offers ({filterApplications('offer').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filterApplications('rejected').length})</TabsTrigger>
            <TabsTrigger value="ghosted">Ghosted ({filterApplications('ghosted').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Start tracking your job applications by adding one manually or connecting your Gmail.
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    Add Your First Application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map(app => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {['applied', 'waiting', 'interview', 'offer', 'rejected', 'ghosted'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              <div className="grid gap-4">
                {filterApplications(status).map(app => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onUpdateStatus={handleUpdateStatus}
                    getStatusIcon={getStatusIcon}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
              {filterApplications(status).length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    {getStatusIcon(status)}
                    <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">
                      No {status} applications
                    </h3>
                    <p className="text-gray-600 text-center">
                      Applications with {status} status will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Add Application Modal */}
        {showAddForm && (
          <ApplicationForm
            onSubmit={handleAddApplication}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  )
}
