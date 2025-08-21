'use client'

import { useState } from 'react'
import { MoreHorizontal, Calendar, Building, User, Edit3, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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

interface ApplicationCardProps {
  application: Application
  onUpdateStatus: (id: string, status: Application['status'], notes?: string) => void
  getStatusIcon: (status: string) => React.ReactNode
  getStatusColor: (status: string) => string
}

export function ApplicationCard({
  application,
  onUpdateStatus,
  getStatusIcon,
  getStatusColor
}: ApplicationCardProps) {
  const formatDateUTC = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const daysSince = (dateString: string) => {
    const date = new Date(dateString)
    const startUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    const now = new Date()
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    return Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24))
  }
  const [isEditing, setIsEditing] = useState(false)
  const [editStatus, setEditStatus] = useState(application.status)
  const [editNotes, setEditNotes] = useState(application.notes || '')

  const handleSave = () => {
    onUpdateStatus(application.id, editStatus, editNotes)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditStatus(application.status)
    setEditNotes(application.notes || '')
    setIsEditing(false)
  }

  const daysSinceApplication = daysSince(application.applicationDate)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{application.position}</h3>
              <Badge className={getStatusColor(application.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(application.status)}
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {application.company}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Applied {formatDateUTC(application.applicationDate)}
              </span>
              <span className="text-gray-500">
                {daysSinceApplication} days ago
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={editStatus} onValueChange={(value: any) => setEditStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="waiting">Waiting for Response</SelectItem>
                  <SelectItem value="interview">Interview Scheduled</SelectItem>
                  <SelectItem value="offer">Offer Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="ghosted">Ghosted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about this application..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {application.notes && (
              <div className="mb-3">
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {application.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last updated: {formatDateUTC(application.lastUpdate)}</span>
              {application.emailId && (
                <Badge variant="outline" className="text-xs">
                  <Mail className="w-3 h-3 mr-1" />
                  Auto-detected
                </Badge>
              )}
            </div>

            {application.status === 'ghosted' && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  💡 This application has been ghosted. Consider following up with the company.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
