'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { FiSend, FiCalendar, FiMessageSquare, FiLoader, FiCheck, FiX, FiClock } from 'react-icons/fi'
import { SiSlack } from 'react-icons/si'

export interface TeamSyncResult {
  action_type?: string
  status?: string
  details?: string
  channel_or_calendar?: string
}

export interface ActivityItem {
  id: string
  type: 'slack' | 'calendar'
  message: string
  status: string
  timestamp: string
}

interface TeamCollaborationProps {
  onSlackMessage: (channel: string, message: string) => Promise<void>
  onCalendarEvent: (title: string, dateTime: string, attendees: string) => Promise<void>
  isSlackSending: boolean
  isCalendarSending: boolean
  slackResult: TeamSyncResult | null
  calendarResult: TeamSyncResult | null
  activityLog: ActivityItem[]
  showSampleData: boolean
}

const SAMPLE_ACTIVITY: ActivityItem[] = [
  { id: '1', type: 'slack', message: 'Campaign brief shared to #marketing-updates', status: 'success', timestamp: '2026-02-27 10:30 AM' },
  { id: '2', type: 'calendar', message: 'Campaign Review Meeting scheduled for Mar 3, 2:00 PM', status: 'success', timestamp: '2026-02-27 09:15 AM' },
  { id: '3', type: 'slack', message: 'Q1 metrics update sent to #analytics', status: 'success', timestamp: '2026-02-26 04:00 PM' },
  { id: '4', type: 'calendar', message: 'Content Planning Sprint booked for Mar 5, 10:00 AM', status: 'success', timestamp: '2026-02-26 11:00 AM' },
]

export default function TeamCollaboration({
  onSlackMessage,
  onCalendarEvent,
  isSlackSending,
  isCalendarSending,
  slackResult,
  calendarResult,
  activityLog,
  showSampleData,
}: TeamCollaborationProps) {
  const [slackChannel, setSlackChannel] = useState('')
  const [slackMessage, setSlackMessage] = useState('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDateTime, setMeetingDateTime] = useState('')
  const [attendeeEmails, setAttendeeEmails] = useState('')

  const displayActivity = showSampleData ? SAMPLE_ACTIVITY : activityLog

  const handleSlackSend = async () => {
    if (!slackChannel.trim() || !slackMessage.trim()) return
    await onSlackMessage(slackChannel, slackMessage)
    setSlackChannel('')
    setSlackMessage('')
  }

  const handleCalendarCreate = async () => {
    if (!meetingTitle.trim() || !meetingDateTime.trim()) return
    await onCalendarEvent(meetingTitle, meetingDateTime, attendeeEmails)
    setMeetingTitle('')
    setMeetingDateTime('')
    setAttendeeEmails('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Team Collaboration</h2>
        <p className="text-sm text-muted-foreground mt-1">Communicate with your team and schedule meetings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <SiSlack className="h-5 w-5 text-purple-500" />
              Slack Messaging
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slackCh">Channel Name *</Label>
              <Input
                id="slackCh"
                placeholder="#marketing-updates"
                value={slackChannel}
                onChange={(e) => setSlackChannel(e.target.value)}
                className="rounded-[0.875rem]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slackMsg">Message *</Label>
              <Textarea
                id="slackMsg"
                placeholder="Type your team update..."
                value={slackMessage}
                onChange={(e) => setSlackMessage(e.target.value)}
                rows={4}
                className="rounded-[0.875rem]"
              />
            </div>
            <Button
              onClick={handleSlackSend}
              disabled={isSlackSending || !slackChannel.trim() || !slackMessage.trim()}
              className="w-full gap-2 rounded-[0.875rem]"
            >
              {isSlackSending ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="h-4 w-4" />
                  Send Update
                </>
              )}
            </Button>

            {slackResult && (
              <div className={`p-3 rounded-[0.875rem] border text-sm ${slackResult.status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {slackResult.status === 'success' ? <FiCheck className="h-4 w-4" /> : <FiX className="h-4 w-4" />}
                  <span className="font-medium">{slackResult.status === 'success' ? 'Message Sent' : 'Failed'}</span>
                </div>
                {slackResult.details && <p className="text-xs mt-1">{slackResult.details}</p>}
                {slackResult.channel_or_calendar && <p className="text-xs mt-1">Channel: {slackResult.channel_or_calendar}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FiCalendar className="h-5 w-5 text-blue-500" />
              Calendar Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meetTitle">Meeting Title *</Label>
              <Input
                id="meetTitle"
                placeholder="Campaign Review Meeting"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="rounded-[0.875rem]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetDate">Date & Time *</Label>
              <Input
                id="meetDate"
                type="datetime-local"
                value={meetingDateTime}
                onChange={(e) => setMeetingDateTime(e.target.value)}
                className="rounded-[0.875rem]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendees">Attendee Emails</Label>
              <Input
                id="attendees"
                placeholder="john@co.com, jane@co.com"
                value={attendeeEmails}
                onChange={(e) => setAttendeeEmails(e.target.value)}
                className="rounded-[0.875rem]"
              />
            </div>
            <Button
              onClick={handleCalendarCreate}
              disabled={isCalendarSending || !meetingTitle.trim() || !meetingDateTime.trim()}
              className="w-full gap-2 rounded-[0.875rem]"
            >
              {isCalendarSending ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <FiCalendar className="h-4 w-4" />
                  Schedule Meeting
                </>
              )}
            </Button>

            {calendarResult && (
              <div className={`p-3 rounded-[0.875rem] border text-sm ${calendarResult.status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {calendarResult.status === 'success' ? <FiCheck className="h-4 w-4" /> : <FiX className="h-4 w-4" />}
                  <span className="font-medium">{calendarResult.status === 'success' ? 'Event Created' : 'Failed'}</span>
                </div>
                {calendarResult.details && <p className="text-xs mt-1">{calendarResult.details}</p>}
                {calendarResult.channel_or_calendar && <p className="text-xs mt-1">Calendar: {calendarResult.channel_or_calendar}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FiClock className="h-5 w-5 text-primary" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayActivity.length === 0 ? (
            <div className="text-center py-8">
              <FiMessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet. Send a Slack message or schedule a meeting to get started.</p>
            </div>
          ) : (
            <ScrollArea className="h-[240px]">
              <div className="space-y-3 pr-4">
                {displayActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
                    <div className={`p-1.5 rounded-full mt-0.5 flex-shrink-0 ${item.type === 'slack' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {item.type === 'slack' ? (
                        <SiSlack className="h-3.5 w-3.5 text-purple-500" />
                      ) : (
                        <FiCalendar className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs rounded-full ${item.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {item.status === 'success' ? 'Sent' : 'Failed'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
