'use client'

import React, { useState, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import parseLLMJson from '@/lib/jsonParser'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiGrid, FiEdit3, FiSend, FiUsers, FiActivity, FiLoader } from 'react-icons/fi'

import CampaignDashboard from './sections/CampaignDashboard'
import type { CampaignRecord } from './sections/CampaignDashboard'
import CampaignBuilder from './sections/CampaignBuilder'
import type { CampaignBrief } from './sections/CampaignBuilder'
import ReviewDistribute from './sections/ReviewDistribute'
import type { CampaignData, DistributionResult, DistributionConfig } from './sections/ReviewDistribute'
import TeamCollaboration from './sections/TeamCollaboration'
import type { TeamSyncResult, ActivityItem } from './sections/TeamCollaboration'

// Agent IDs
const COORDINATOR_ID = '69a1d24f64718f82ff22f3ab'
const DISTRIBUTOR_ID = '69a1d284ddd8356cffb7954a'
const TEAM_SYNC_ID = '69a1d2843ab18859fbddcd5a'

const AGENTS = [
  { id: COORDINATOR_ID, name: 'Campaign Coordinator', purpose: 'Orchestrates campaign creation via research and content sub-agents' },
  { id: '69a1d23c030dec256cffea25', name: 'Trend Research Agent', purpose: 'Researches market trends and competitors (sub-agent)' },
  { id: '69a1d23c030dec256cffea27', name: 'Content Creator Agent', purpose: 'Generates social posts, emails, taglines, and campaign images (sub-agent)' },
  { id: DISTRIBUTOR_ID, name: 'Campaign Distributor', purpose: 'Distributes content to Twitter, Gmail, and Slack' },
  { id: TEAM_SYNC_ID, name: 'Team Sync Agent', purpose: 'Sends Slack messages and creates calendar events' },
]

const SAMPLE_CAMPAIGN_DATA: CampaignData = {
  executive_summary: 'A comprehensive marketing campaign for the Spring 2026 Product Launch targeting tech professionals. The campaign leverages current AI productivity trends and positions our solution against competitors like Notion AI and Microsoft Copilot.',
  research_insights: {
    trends: [
      { trend: 'AI-Powered Productivity Tools', relevance: 'High - directly aligns with product offering', recommendation: 'Lead with time-saving metrics and ROI data' },
      { trend: 'Enterprise AI Adoption Wave', relevance: 'Medium - growing corporate demand', recommendation: 'Highlight enterprise security and compliance features' },
      { trend: 'Remote Work Optimization', relevance: 'High - key use case for target audience', recommendation: 'Showcase remote collaboration features' },
    ],
    competitor_insights: [
      { competitor: 'Notion AI', activity: 'Launched new AI writing assistant features', takeaway: 'Focus on workflow automation as our differentiator' },
      { competitor: 'Microsoft Copilot', activity: 'Expanding enterprise integrations', takeaway: 'Emphasize our platform-agnostic approach and ease of setup' },
    ],
    audience_insights: 'Primary audience consists of tech-savvy professionals aged 25-45 who value efficiency. They are early adopters, active on Twitter, and respond well to data-driven messaging with clear ROI demonstrations.',
    recommended_hashtags: ['#AIProductivity', '#FutureOfWork', '#TechLaunch2026', '#WorkSmarter', '#AIAssistant'],
    timing_recommendation: 'Best posting times: Tuesday-Thursday 9-11 AM EST. Launch emails on Tuesday morning for highest open rates.',
  },
  social_posts: [
    { platform: 'Twitter', content: 'Tired of wasting 10+ hours per week on repetitive tasks? Our new AI assistant automates your workflow so you can focus on what matters. Join 500+ enterprises already transforming their productivity.', hashtags: '#AIProductivity #FutureOfWork #WorkSmarter' },
    { platform: 'Twitter', content: 'The future of work is here. Our latest AI-powered tool saves teams an average of 12 hours per week. See how it compares to Notion AI and Copilot in our head-to-head benchmark.', hashtags: '#TechLaunch2026 #AIAssistant #Productivity' },
  ],
  email_campaign: {
    subject_line: 'Save 10+ Hours Every Week with AI-Powered Automation',
    preview_text: 'See how 500+ enterprises are transforming their workflow',
    body: 'Hi there,\n\nWe are excited to announce our latest AI assistant feature that is helping teams save 10+ hours every week on repetitive tasks.\n\nHere is what makes us different:\n- Intelligent workflow automation\n- Enterprise-grade security\n- Seamless integration with your existing tools\n\nJoin 500+ enterprises already seeing results.\n\nBest regards,\nThe Team',
    cta: 'Start Your Free Trial',
  },
  taglines: [
    'Work Smarter, Not Harder - Powered by AI',
    'Your AI Productivity Partner for the Modern Workplace',
    'Automate the Mundane. Amplify Your Impact.',
  ],
  key_messages: [
    'Save 10+ hours per week with AI-powered automation',
    'Trusted by 500+ enterprises worldwide',
    'Enterprise-grade security with platform-agnostic integration',
    'Outperforms competitors in workflow automation benchmarks',
  ],
  image_description: 'A sleek, modern banner featuring AI productivity tools with a futuristic blue-orange gradient background and abstract circuit patterns.',
  campaign_images: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop'
  ],
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

type ScreenName = 'dashboard' | 'builder' | 'review' | 'collaboration'

export default function Page() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>('dashboard')
  const [showSampleData, setShowSampleData] = useState(false)

  // Campaign state
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([])
  const [postsSent, setPostsSent] = useState(0)
  const [emailsDelivered, setEmailsDelivered] = useState(0)
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  // Distribution state
  const [isDistributing, setIsDistributing] = useState(false)
  const [distributionResult, setDistributionResult] = useState<DistributionResult | null>(null)

  // Team collaboration state
  const [isSlackSending, setIsSlackSending] = useState(false)
  const [isCalendarSending, setIsCalendarSending] = useState(false)
  const [slackResult, setSlackResult] = useState<TeamSyncResult | null>(null)
  const [calendarResult, setCalendarResult] = useState<TeamSyncResult | null>(null)
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([])

  // Active agent tracking
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Track whether user has real campaign data
  const [hasRealData, setHasRealData] = useState(false)

  // Sample data effect
  useEffect(() => {
    if (showSampleData && !hasRealData) {
      setCampaignData(SAMPLE_CAMPAIGN_DATA)
    }
    if (!showSampleData && !hasRealData) {
      setCampaignData(null)
    }
  }, [showSampleData, hasRealData])

  // Campaign generation handler
  const handleGenerate = async (brief: CampaignBrief) => {
    setIsGenerating(true)
    setGenerateError(null)
    setActiveAgentId(COORDINATOR_ID)

    try {
      const message = `Generate a comprehensive marketing campaign with the following brief:
Campaign Name: ${brief.campaignName}
Target Audience: ${brief.targetAudience}
Key Messages: ${brief.keyMessages}
Tone: ${brief.tone}
Channels: ${brief.channels.join(', ')}
Additional Context: ${brief.additionalContext}

Please provide:
1. An executive summary
2. Research insights including trends, competitor insights, audience insights, recommended hashtags, and timing recommendations
3. Social media posts for the selected channels with hashtags
4. An email campaign with subject line, preview text, body, and CTA
5. Campaign taglines
6. Key messages
7. A campaign visual/banner image that matches the campaign theme and audience - generate an eye-catching, professional image suitable for social media headers and email banners`

      const result = await callAIAgent(message, COORDINATOR_ID)

      if (result.success) {
        let data = result.response?.result
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          data = parseLLMJson(result.raw_response || result.response?.message)
        }
        if (data && typeof data === 'object') {
          // Extract campaign images from module_outputs (top-level, from Content Creator sub-agent with DALL-E 3)
          const artifactFiles = result.module_outputs?.artifact_files
          const campaignImages: string[] = []
          if (Array.isArray(artifactFiles)) {
            artifactFiles.forEach((file: any) => {
              if (file?.file_url) {
                campaignImages.push(file.file_url)
              }
            })
          }

          const enrichedData: CampaignData = {
            ...(data as CampaignData),
            campaign_images: campaignImages.length > 0 ? campaignImages : undefined,
            image_description: (data as any)?.image_description ?? undefined,
          }

          setCampaignData(enrichedData)
          setHasRealData(true)
          const newCampaign: CampaignRecord = {
            id: String(Date.now()),
            name: brief.campaignName,
            status: 'Draft',
            date: new Date().toISOString().split('T')[0],
            channels: brief.channels,
          }
          setCampaigns(prev => [newCampaign, ...prev])
          setActiveScreen('review')
        } else {
          setGenerateError('Could not parse campaign data from agent response.')
        }
      } else {
        setGenerateError(result.error ?? 'Failed to generate campaign.')
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsGenerating(false)
      setActiveAgentId(null)
    }
  }

  // Distribution handler
  const handleDistribute = async (config: DistributionConfig) => {
    setIsDistributing(true)
    setDistributionResult(null)
    setActiveAgentId(DISTRIBUTOR_ID)

    try {
      const enabledChannels: string[] = []
      if (config.twitterEnabled) enabledChannels.push('Twitter')
      if (config.gmailEnabled) enabledChannels.push('Gmail')
      if (config.slackEnabled) enabledChannels.push('Slack')

      const postTexts = Array.isArray(config.socialPosts)
        ? config.socialPosts.map(p => `${p?.content ?? ''} ${p?.hashtags ?? ''}`).join('\n---\n')
        : ''

      let message = `Distribute the following campaign content to these channels: ${enabledChannels.join(', ')}\n\n`

      if (config.twitterEnabled && postTexts) {
        message += `TWITTER POST:\n${postTexts}\n\n`
      }

      if (config.gmailEnabled) {
        message += `GMAIL EMAIL:\nRecipient(s): ${config.recipientEmails}\nSubject: ${config.emailCampaign.subject_line}\nPreview: ${config.emailCampaign.preview_text}\nBody: ${config.emailCampaign.body}\nCTA: ${config.emailCampaign.cta}\n\n`
      }

      if (config.slackEnabled) {
        message += `SLACK MESSAGE:\nChannel: ${config.slackChannel}\nMessage: Campaign update - ${config.emailCampaign.subject_line}. ${Array.isArray(config.socialPosts) && config.socialPosts.length > 0 ? config.socialPosts[0]?.content ?? '' : ''}\n\n`
      }

      const result = await callAIAgent(message, DISTRIBUTOR_ID)

      if (result.success) {
        let data = result.response?.result
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          data = parseLLMJson(result.raw_response || result.response?.message)
        }
        if (data && typeof data === 'object') {
          setDistributionResult(data as DistributionResult)
          const ds = (data as DistributionResult).distribution_status
          if (ds?.twitter?.success) setPostsSent(prev => prev + 1)
          if (ds?.gmail?.success) setEmailsDelivered(prev => prev + 1)
          setCampaigns(prev => {
            if (prev.length > 0) {
              const updated = [...prev]
              updated[0] = { ...updated[0], status: 'Live' }
              return updated
            }
            return prev
          })
        }
      }
    } catch (err) {
      // silently handled - UI shows no result
    } finally {
      setIsDistributing(false)
      setActiveAgentId(null)
    }
  }

  // Slack message handler
  const handleSlackMessage = async (channel: string, messageText: string) => {
    setIsSlackSending(true)
    setSlackResult(null)
    setActiveAgentId(TEAM_SYNC_ID)

    try {
      const message = `Send a Slack message to channel ${channel} with the following content: ${messageText}`
      const result = await callAIAgent(message, TEAM_SYNC_ID)

      if (result.success) {
        let data = result.response?.result
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          data = parseLLMJson(result.raw_response || result.response?.message)
        }
        if (data && typeof data === 'object') {
          setSlackResult(data as TeamSyncResult)
          const newItem: ActivityItem = {
            id: String(Date.now()),
            type: 'slack',
            message: `Message sent to ${channel}: "${messageText.substring(0, 60)}${messageText.length > 60 ? '...' : ''}"`,
            status: (data as TeamSyncResult).status === 'success' ? 'success' : 'failed',
            timestamp: new Date().toLocaleString(),
          }
          setActivityLog(prev => [newItem, ...prev])
        }
      }
    } catch (err) {
      // silently handled
    } finally {
      setIsSlackSending(false)
      setActiveAgentId(null)
    }
  }

  // Calendar event handler
  const handleCalendarEvent = async (title: string, dateTime: string, attendees: string) => {
    setIsCalendarSending(true)
    setCalendarResult(null)
    setActiveAgentId(TEAM_SYNC_ID)

    try {
      const message = `Create a Google Calendar event with the following details:
Title: ${title}
Date and Time: ${dateTime}
Attendees: ${attendees || 'No additional attendees'}

Please schedule this meeting and send invites to the attendees.`

      const result = await callAIAgent(message, TEAM_SYNC_ID)

      if (result.success) {
        let data = result.response?.result
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
          data = parseLLMJson(result.raw_response || result.response?.message)
        }
        if (data && typeof data === 'object') {
          setCalendarResult(data as TeamSyncResult)
          const newItem: ActivityItem = {
            id: String(Date.now()),
            type: 'calendar',
            message: `"${title}" scheduled for ${dateTime}`,
            status: (data as TeamSyncResult).status === 'success' ? 'success' : 'failed',
            timestamp: new Date().toLocaleString(),
          }
          setActivityLog(prev => [newItem, ...prev])
        }
      }
    } catch (err) {
      // silently handled
    } finally {
      setIsCalendarSending(false)
      setActiveAgentId(null)
    }
  }

  const navItems: { key: ScreenName; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <FiGrid className="h-4 w-4" /> },
    { key: 'builder', label: 'Campaign Builder', icon: <FiEdit3 className="h-4 w-4" /> },
    { key: 'review', label: 'Review & Distribute', icon: <FiSend className="h-4 w-4" /> },
    { key: 'collaboration', label: 'Team Collaboration', icon: <FiUsers className="h-4 w-4" /> },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card/75 backdrop-blur-[16px] border-r border-border flex flex-col flex-shrink-0 h-screen sticky top-0">
          <div className="p-5 border-b border-border">
            <h1 className="text-lg font-bold text-foreground">Marketing Team Hub</h1>
            <p className="text-xs text-muted-foreground mt-0.5">AI-Powered Campaign Management</p>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveScreen(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[0.875rem] text-sm font-medium transition-all duration-200 ${activeScreen === item.key ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Agent Status */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 px-3 mb-2">
              <FiActivity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agents</span>
            </div>
            <ScrollArea className="h-[180px]">
              <div className="space-y-1 px-1 pr-3">
                {AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  >
                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{agent.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Sample Data Toggle */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">
                Sample Data
              </Label>
              <Switch
                id="sample-toggle"
                checked={showSampleData}
                onCheckedChange={setShowSampleData}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto min-h-screen">
          <div className="max-w-4xl mx-auto p-6">
            {/* Error banner for generation */}
            {generateError && activeScreen === 'builder' && (
              <div className="mb-4 p-3 rounded-[0.875rem] bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
                <span>{generateError}</span>
                <button onClick={() => setGenerateError(null)} className="ml-auto text-xs underline">Dismiss</button>
              </div>
            )}

            {/* Active Agent Indicator */}
            {activeAgentId && (
              <div className="mb-4 p-3 rounded-[0.875rem] bg-primary/5 border border-primary/10 flex items-center gap-3">
                <FiLoader className="h-4 w-4 text-primary animate-spin" />
                <span className="text-sm text-foreground">
                  {AGENTS.find(a => a.id === activeAgentId)?.name ?? 'Agent'} is processing...
                </span>
                <Badge variant="outline" className="ml-auto text-xs rounded-full bg-primary/10 text-primary border-primary/20">
                  Active
                </Badge>
              </div>
            )}

            {activeScreen === 'dashboard' && (
              <CampaignDashboard
                campaigns={campaigns}
                postsSent={postsSent}
                emailsDelivered={emailsDelivered}
                onNewCampaign={() => setActiveScreen('builder')}
                showSampleData={showSampleData}
              />
            )}

            {activeScreen === 'builder' && (
              <CampaignBuilder
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}

            {activeScreen === 'review' && (
              <ReviewDistribute
                campaignData={showSampleData && !hasRealData ? SAMPLE_CAMPAIGN_DATA : campaignData}
                onDistribute={handleDistribute}
                isDistributing={isDistributing}
                distributionResult={distributionResult}
                onGoToBuild={() => setActiveScreen('builder')}
              />
            )}

            {activeScreen === 'collaboration' && (
              <TeamCollaboration
                onSlackMessage={handleSlackMessage}
                onCalendarEvent={handleCalendarEvent}
                isSlackSending={isSlackSending}
                isCalendarSending={isCalendarSending}
                slackResult={slackResult}
                calendarResult={calendarResult}
                activityLog={activityLog}
                showSampleData={showSampleData}
              />
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
