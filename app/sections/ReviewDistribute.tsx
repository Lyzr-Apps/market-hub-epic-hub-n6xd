'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { FiSend, FiChevronDown, FiChevronUp, FiCheck, FiX, FiLoader, FiHash, FiClock, FiUsers, FiTrendingUp, FiImage, FiDownload, FiExternalLink } from 'react-icons/fi'
import { BsTwitterX } from 'react-icons/bs'
import { SiSlack, SiGmail } from 'react-icons/si'

export interface CampaignData {
  executive_summary?: string
  research_insights?: {
    trends?: Array<{ trend?: string; relevance?: string; recommendation?: string }>
    competitor_insights?: Array<{ competitor?: string; activity?: string; takeaway?: string }>
    audience_insights?: string
    recommended_hashtags?: string[]
    timing_recommendation?: string
  }
  social_posts?: Array<{ platform?: string; content?: string; hashtags?: string }>
  email_campaign?: { subject_line?: string; preview_text?: string; body?: string; cta?: string }
  taglines?: string[]
  key_messages?: string[]
  image_description?: string
  campaign_images?: string[]
}

export interface DistributionResult {
  distribution_status?: {
    twitter?: { success?: boolean; message?: string }
    gmail?: { success?: boolean; message?: string }
    slack?: { success?: boolean; message?: string }
  }
  summary?: string
}

interface ReviewDistributeProps {
  campaignData: CampaignData | null
  onDistribute: (config: DistributionConfig) => Promise<void>
  isDistributing: boolean
  distributionResult: DistributionResult | null
  onGoToBuild: () => void
}

export interface DistributionConfig {
  twitterEnabled: boolean
  gmailEnabled: boolean
  slackEnabled: boolean
  recipientEmails: string
  slackChannel: string
  socialPosts: Array<{ platform?: string; content?: string; hashtags?: string }>
  emailCampaign: { subject_line: string; preview_text: string; body: string; cta: string }
}

const SAMPLE_CAMPAIGN: CampaignData = {
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

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInlineText(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInlineText(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{formatInlineText(line)}</p>
      })}
    </div>
  )
}

function formatInlineText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part)
}

export default function ReviewDistribute({ campaignData, onDistribute, isDistributing, distributionResult, onGoToBuild }: ReviewDistributeProps) {
  const data = campaignData ?? null
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [twitterEnabled, setTwitterEnabled] = useState(true)
  const [gmailEnabled, setGmailEnabled] = useState(true)
  const [slackEnabled, setSlackEnabled] = useState(true)
  const [recipientEmails, setRecipientEmails] = useState('')
  const [slackChannel, setSlackChannel] = useState('')

  const [editablePosts, setEditablePosts] = useState<Array<{ platform?: string; content?: string; hashtags?: string }>>([])
  const [editableEmail, setEditableEmail] = useState({ subject_line: '', preview_text: '', body: '', cta: '' })

  useEffect(() => {
    if (data) {
      setEditablePosts(Array.isArray(data.social_posts) ? data.social_posts.map(p => ({ ...p })) : [])
      setEditableEmail({
        subject_line: data.email_campaign?.subject_line ?? '',
        preview_text: data.email_campaign?.preview_text ?? '',
        body: data.email_campaign?.body ?? '',
        cta: data.email_campaign?.cta ?? '',
      })
    }
  }, [data])

  const handleDistribute = async () => {
    await onDistribute({
      twitterEnabled,
      gmailEnabled,
      slackEnabled,
      recipientEmails,
      slackChannel,
      socialPosts: editablePosts,
      emailCampaign: editableEmail,
    })
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Review & Distribute</h2>
          <p className="text-sm text-muted-foreground mt-1">Review generated content and distribute to channels</p>
        </div>
        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <FiSend className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-4">No campaign content to review yet. Generate a campaign first.</p>
              <Button onClick={onGoToBuild} variant="outline" className="gap-2 rounded-[0.875rem]">
                Go to Campaign Builder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const trends = Array.isArray(data.research_insights?.trends) ? data.research_insights.trends : []
  const competitors = Array.isArray(data.research_insights?.competitor_insights) ? data.research_insights.competitor_insights : []
  const hashtags = Array.isArray(data.research_insights?.recommended_hashtags) ? data.research_insights.recommended_hashtags : []
  const taglines = Array.isArray(data.taglines) ? data.taglines : []
  const keyMessages = Array.isArray(data.key_messages) ? data.key_messages : []
  const campaignImages = Array.isArray(data.campaign_images) ? data.campaign_images : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review & Distribute</h2>
        <p className="text-sm text-muted-foreground mt-1">Review generated content and distribute to channels</p>
      </div>

      {data.executive_summary && (
        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-[0.875rem] bg-primary/10 mt-0.5">
                <FiTrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Executive Summary</p>
                <div className="text-sm text-foreground">{renderMarkdown(data.executive_summary)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Collapsible open={insightsOpen} onOpenChange={setInsightsOpen}>
        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-[0.875rem]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FiTrendingUp className="h-5 w-5 text-primary" />
                  Research Insights
                </CardTitle>
                {insightsOpen ? <FiChevronUp className="h-5 w-5 text-muted-foreground" /> : <FiChevronDown className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-5 pt-0">
              {trends.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Trends</p>
                  <div className="space-y-2">
                    {trends.map((t, i) => (
                      <div key={i} className="p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
                        <p className="text-sm font-medium text-foreground">{t?.trend ?? ''}</p>
                        <p className="text-xs text-muted-foreground mt-1">Relevance: {t?.relevance ?? 'N/A'}</p>
                        <p className="text-xs text-primary mt-1">{t?.recommendation ?? ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {competitors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Competitor Insights</p>
                  <div className="space-y-2">
                    {competitors.map((c, i) => (
                      <div key={i} className="p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
                        <p className="text-sm font-medium text-foreground">{c?.competitor ?? ''}</p>
                        <p className="text-xs text-muted-foreground mt-1">{c?.activity ?? ''}</p>
                        <p className="text-xs text-primary mt-1">Takeaway: {c?.takeaway ?? ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.research_insights?.audience_insights && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><FiUsers className="h-3.5 w-3.5" /> Audience Insights</p>
                  <p className="text-sm text-foreground">{data.research_insights.audience_insights}</p>
                </div>
              )}

              {hashtags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><FiHash className="h-3.5 w-3.5" /> Recommended Hashtags</p>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((h, i) => (
                      <Badge key={i} variant="secondary" className="rounded-full text-xs">{h ?? ''}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.research_insights?.timing_recommendation && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><FiClock className="h-3.5 w-3.5" /> Timing</p>
                  <p className="text-sm text-foreground">{data.research_insights.timing_recommendation}</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Tabs defaultValue="social" className="w-full">
        <TabsList className="w-full rounded-[0.875rem]">
          <TabsTrigger value="social" className="flex-1 rounded-[0.875rem]">Social Posts</TabsTrigger>
          <TabsTrigger value="email" className="flex-1 rounded-[0.875rem]">Email Copy</TabsTrigger>
          <TabsTrigger value="taglines" className="flex-1 rounded-[0.875rem]">Taglines</TabsTrigger>
          <TabsTrigger value="visuals" className="flex-1 rounded-[0.875rem] gap-1.5">
            <FiImage className="h-3.5 w-3.5" />
            Visuals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="mt-4">
          <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
            <CardContent className="pt-5 space-y-4">
              {editablePosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No social posts generated</p>
              ) : (
                editablePosts.map((post, idx) => (
                  <div key={idx} className="space-y-2 p-4 rounded-[0.875rem] bg-background/60 border border-border/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs rounded-full">{post?.platform ?? 'Social'}</Badge>
                    </div>
                    <Textarea
                      value={post?.content ?? ''}
                      onChange={(e) => {
                        const updated = [...editablePosts]
                        updated[idx] = { ...updated[idx], content: e.target.value }
                        setEditablePosts(updated)
                      }}
                      rows={3}
                      className="rounded-[0.875rem] text-sm"
                    />
                    <Input
                      value={post?.hashtags ?? ''}
                      onChange={(e) => {
                        const updated = [...editablePosts]
                        updated[idx] = { ...updated[idx], hashtags: e.target.value }
                        setEditablePosts(updated)
                      }}
                      placeholder="Hashtags"
                      className="rounded-[0.875rem] text-xs text-muted-foreground"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Subject Line</Label>
                <Input
                  value={editableEmail.subject_line}
                  onChange={(e) => setEditableEmail(prev => ({ ...prev, subject_line: e.target.value }))}
                  className="rounded-[0.875rem]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Preview Text</Label>
                <Input
                  value={editableEmail.preview_text}
                  onChange={(e) => setEditableEmail(prev => ({ ...prev, preview_text: e.target.value }))}
                  className="rounded-[0.875rem]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Body</Label>
                <Textarea
                  value={editableEmail.body}
                  onChange={(e) => setEditableEmail(prev => ({ ...prev, body: e.target.value }))}
                  rows={8}
                  className="rounded-[0.875rem] text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Call to Action</Label>
                <Input
                  value={editableEmail.cta}
                  onChange={(e) => setEditableEmail(prev => ({ ...prev, cta: e.target.value }))}
                  className="rounded-[0.875rem]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taglines" className="mt-4">
          <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
            <CardContent className="pt-5 space-y-4">
              {taglines.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Taglines</p>
                  <div className="space-y-2">
                    {taglines.map((t, i) => (
                      <div key={i} className="p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
                        <p className="text-sm font-medium text-foreground">{t ?? ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {keyMessages.length > 0 && (
                <div>
                  <Separator className="my-4" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Key Messages</p>
                  <div className="space-y-2">
                    {keyMessages.map((m, i) => (
                      <div key={i} className="p-3 rounded-[0.875rem] bg-background/60 border border-border/60 flex items-start gap-2">
                        <FiCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground">{m ?? ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {taglines.length === 0 && keyMessages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No taglines or key messages generated</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visuals" className="mt-4">
          <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
            <CardContent className="pt-5 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <FiImage className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">Campaign Visuals</p>
                <Badge variant="secondary" className="rounded-full text-[10px] ml-auto">AI Generated</Badge>
              </div>

              {data.image_description && (
                <div className="p-3 rounded-[0.875rem] bg-primary/5 border border-primary/10">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Image Description</p>
                  <p className="text-sm text-foreground">{data.image_description}</p>
                </div>
              )}

              {campaignImages.length > 0 ? (
                <div className="space-y-4">
                  {campaignImages.map((imageUrl, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="relative group rounded-[0.875rem] overflow-hidden border border-border bg-background/60">
                        <img
                          src={imageUrl}
                          alt={`Campaign visual ${idx + 1}`}
                          className="w-full h-auto object-cover rounded-[0.875rem]"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                        <div className="hidden items-center justify-center h-48 bg-muted/30 text-muted-foreground text-sm">
                          <FiImage className="h-8 w-8 mr-2 opacity-40" />
                          Image could not be loaded
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-[0.875rem] flex items-end justify-end p-3 opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-foreground hover:bg-white transition-colors shadow-md"
                              title="Open in new tab"
                            >
                              <FiExternalLink className="h-4 w-4" />
                            </a>
                            <a
                              href={imageUrl}
                              download={`campaign-visual-${idx + 1}.png`}
                              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-foreground hover:bg-white transition-colors shadow-md"
                              title="Download image"
                            >
                              <FiDownload className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Campaign Visual {idx + 1} - Generated by DALL-E 3
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiImage className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">No campaign visuals generated yet</p>
                  <p className="text-xs text-muted-foreground">Campaign images will be generated automatically when you create a new campaign using the Campaign Builder.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
        <CardHeader>
          <CardTitle className="text-lg">Distribution Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
              <div className="flex items-center gap-2.5">
                <BsTwitterX className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium">Twitter / X</span>
              </div>
              <Switch checked={twitterEnabled} onCheckedChange={setTwitterEnabled} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
              <div className="flex items-center gap-2.5">
                <SiGmail className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Gmail</span>
              </div>
              <Switch checked={gmailEnabled} onCheckedChange={setGmailEnabled} />
            </div>

            {gmailEnabled && (
              <div className="pl-10 space-y-2">
                <Label className="text-xs">Recipient Email(s)</Label>
                <Input
                  placeholder="e.g., team@company.com, marketing@company.com"
                  value={recipientEmails}
                  onChange={(e) => setRecipientEmails(e.target.value)}
                  className="rounded-[0.875rem]"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
              <div className="flex items-center gap-2.5">
                <SiSlack className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Slack</span>
              </div>
              <Switch checked={slackEnabled} onCheckedChange={setSlackEnabled} />
            </div>

            {slackEnabled && (
              <div className="pl-10 space-y-2">
                <Label className="text-xs">Slack Channel</Label>
                <Input
                  placeholder="e.g., #marketing-updates"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  className="rounded-[0.875rem]"
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleDistribute}
            disabled={isDistributing || (!twitterEnabled && !gmailEnabled && !slackEnabled)}
            className="w-full gap-2 rounded-[0.875rem] h-11"
          >
            {isDistributing ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Distributing...
              </>
            ) : (
              <>
                <FiSend className="h-4 w-4" />
                Distribute Campaign
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {distributionResult && (
        <Card className="bg-card/75 backdrop-blur-[16px] border-border rounded-[0.875rem]">
          <CardHeader>
            <CardTitle className="text-lg">Distribution Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {distributionResult.distribution_status?.twitter && (
              <div className="flex items-center justify-between p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <BsTwitterX className="h-4 w-4" />
                  <span className="text-sm">Twitter</span>
                </div>
                <div className="flex items-center gap-2">
                  {distributionResult.distribution_status.twitter.success ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full"><FiCheck className="h-3 w-3 mr-1" /> Sent</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-200 rounded-full"><FiX className="h-3 w-3 mr-1" /> Failed</Badge>
                  )}
                </div>
              </div>
            )}
            {distributionResult.distribution_status?.gmail && (
              <div className="flex items-center justify-between p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <SiGmail className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Gmail</span>
                </div>
                <div className="flex items-center gap-2">
                  {distributionResult.distribution_status.gmail.success ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full"><FiCheck className="h-3 w-3 mr-1" /> Sent</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-200 rounded-full"><FiX className="h-3 w-3 mr-1" /> Failed</Badge>
                  )}
                </div>
              </div>
            )}
            {distributionResult.distribution_status?.slack && (
              <div className="flex items-center justify-between p-3 rounded-[0.875rem] bg-background/60 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <SiSlack className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Slack</span>
                </div>
                <div className="flex items-center gap-2">
                  {distributionResult.distribution_status.slack.success ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full"><FiCheck className="h-3 w-3 mr-1" /> Sent</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-red-200 rounded-full"><FiX className="h-3 w-3 mr-1" /> Failed</Badge>
                  )}
                </div>
              </div>
            )}
            {distributionResult.distribution_status?.twitter?.message && (
              <p className="text-xs text-muted-foreground">{distributionResult.distribution_status.twitter.message}</p>
            )}
            {distributionResult.distribution_status?.gmail?.message && (
              <p className="text-xs text-muted-foreground">{distributionResult.distribution_status.gmail.message}</p>
            )}
            {distributionResult.distribution_status?.slack?.message && (
              <p className="text-xs text-muted-foreground">{distributionResult.distribution_status.slack.message}</p>
            )}
            {distributionResult.summary && (
              <div className="mt-3 p-3 rounded-[0.875rem] bg-primary/5 border border-primary/10">
                <p className="text-sm text-foreground">{renderMarkdown(distributionResult.summary)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
