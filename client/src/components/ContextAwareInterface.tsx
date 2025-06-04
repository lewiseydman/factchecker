import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  TrendingUp, 
  User, 
  Clock, 
  MapPin, 
  Shield, 
  Eye,
  ChevronRight,
  Activity
} from 'lucide-react';

interface ContextData {
  dateSpoken?: string;
  location?: string;
  audience?: string;
  politicalContext?: string;
  originalContext?: string;
}

export default function ContextAwareInterface() {
  const { toast } = useToast();
  const [statement, setStatement] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [contextData, setContextData] = useState<ContextData>({});
  const [selectedSpeaker, setSelectedSpeaker] = useState('');

  // Context analysis mutation
  const contextAnalysisMutation = useMutation({
    mutationFn: async (data: {
      statement: string;
      speakerName?: string;
      sourceName?: string;
      contextData?: ContextData;
    }) => {
      const response = await apiRequest('POST', '/api/context/analyze-context', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Context Analysis Complete",
        description: `Verification level: ${data.analysis.recommendedVerificationLevel}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch active alerts
  const { data: alertsData } = useQuery({
    queryKey: ['/api/context/alerts'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch trending claims
  const { data: trendingData } = useQuery({
    queryKey: ['/api/context/trending-claims'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch credibility report
  const credibilityQuery = useQuery({
    queryKey: ['/api/context/credibility-report', selectedSpeaker],
    enabled: !!selectedSpeaker,
  });

  const handleContextAnalysis = () => {
    if (!statement.trim()) {
      toast({
        title: "Statement Required",
        description: "Please enter a statement to analyze",
        variant: "destructive",
      });
      return;
    }

    contextAnalysisMutation.mutate({
      statement,
      speakerName: speakerName || undefined,
      sourceName: sourceName || undefined,
      contextData: Object.keys(contextData).length > 0 ? contextData : undefined,
    });
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Context-Aware Fact Checking
        </h1>
        <p className="text-muted-foreground mt-2">
          Track WHO said what, WHEN, and monitor misinformation patterns in real-time
        </p>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyze">Analyze Statement</TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alerts ({alertsData?.alerts?.totalActive || 0})
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="credibility">
            <Shield className="w-4 h-4 mr-2" />
            Credibility
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Context-Aware Analysis
              </CardTitle>
              <CardDescription>
                Provide statement details and context for comprehensive verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statement">Statement to Analyze</Label>
                <Textarea
                  id="statement"
                  placeholder="Enter the statement you want to fact-check..."
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speaker">Speaker Name (Optional)</Label>
                  <Input
                    id="speaker"
                    placeholder="Who made this statement?"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source (Optional)</Label>
                  <Input
                    id="source"
                    placeholder="Where was this statement made?"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date Spoken (Optional)</Label>
                  <Input
                    id="date"
                    type="date"
                    value={contextData.dateSpoken || ''}
                    onChange={(e) => setContextData({...contextData, dateSpoken: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="Where was this said?"
                    value={contextData.location || ''}
                    onChange={(e) => setContextData({...contextData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">Audience (Optional)</Label>
                  <Input
                    id="audience"
                    placeholder="Who was the audience?"
                    value={contextData.audience || ''}
                    onChange={(e) => setContextData({...contextData, audience: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="political-context">Political Context (Optional)</Label>
                  <Input
                    id="political-context"
                    placeholder="Any political context?"
                    value={contextData.politicalContext || ''}
                    onChange={(e) => setContextData({...contextData, politicalContext: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleContextAnalysis}
                disabled={contextAnalysisMutation.isPending}
                className="w-full"
              >
                {contextAnalysisMutation.isPending ? "Analyzing..." : "Analyze Context"}
              </Button>

              {contextAnalysisMutation.data && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Analysis Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Speaker Credibility</span>
                          <span className={`text-sm font-bold ${getCredibilityColor(contextAnalysisMutation.data.analysis.speakerCredibility)}`}>
                            {(contextAnalysisMutation.data.analysis.speakerCredibility * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={contextAnalysisMutation.data.analysis.speakerCredibility * 100} 
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Source Credibility</span>
                          <span className={`text-sm font-bold ${getCredibilityColor(contextAnalysisMutation.data.analysis.sourceCredibility)}`}>
                            {(contextAnalysisMutation.data.analysis.sourceCredibility * 100).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={contextAnalysisMutation.data.analysis.sourceCredibility * 100} 
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Recommended Verification Level</span>
                        <Badge variant={
                          contextAnalysisMutation.data.analysis.recommendedVerificationLevel === 'critical' ? 'destructive' :
                          contextAnalysisMutation.data.analysis.recommendedVerificationLevel === 'high' ? 'secondary' :
                          'default'
                        }>
                          {contextAnalysisMutation.data.analysis.recommendedVerificationLevel.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {contextAnalysisMutation.data.analysis.contextualRiskFactors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-orange-600">Risk Factors:</h4>
                          {contextAnalysisMutation.data.analysis.contextualRiskFactors.map((factor: string, index: number) => (
                            <Alert key={index} className="border-orange-200">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>{factor}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}

                      {contextAnalysisMutation.data.analysis.historicalPatterns.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <h4 className="text-sm font-semibold text-blue-600">Historical Patterns:</h4>
                          {contextAnalysisMutation.data.analysis.historicalPatterns.map((pattern: string, index: number) => (
                            <Alert key={index} className="border-blue-200">
                              <Activity className="h-4 w-4" />
                              <AlertDescription>{pattern}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Active Misinformation Alerts
              </CardTitle>
              <CardDescription>
                Real-time monitoring of viral false claims and trending misinformation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertsData?.alerts?.alerts?.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {alertsData.alerts.criticalCount}
                        </div>
                        <div className="text-sm text-muted-foreground">Critical Alerts</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {alertsData.alerts.highCount}
                        </div>
                        <div className="text-sm text-muted-foreground">High Priority</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {alertsData.alerts.totalActive}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Active</div>
                      </CardContent>
                    </Card>
                  </div>

                  {alertsData.alerts.alerts.map((alert: any) => (
                    <Card key={alert.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Badge className={`${getAlertLevelColor(alert.alertLevel)} text-white mr-2`}>
                                {alert.alertLevel.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(alert.firstDetected).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{alert.description}</p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Activity className="w-3 h-3 mr-1" />
                              Virality Score: {(alert.viralityScore * 100).toFixed(0)}%
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active alerts at this time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trending Viral Claims
              </CardTitle>
              <CardDescription>
                Monitor claims spreading rapidly across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendingData?.trending?.claims?.length > 0 ? (
                <div className="space-y-4">
                  {trendingData.trending.claims.map((claim: any) => (
                    <Card key={claim.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm mb-2">{claim.claimText}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {claim.estimatedReach?.toLocaleString() || 0} reach
                              </div>
                              <div className="flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {claim.growthRate?.toFixed(1) || 0}x growth
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(claim.firstSeen).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant={claim.factCheckStatus === 'verified_false' ? 'destructive' : 'secondary'}>
                            {claim.factCheckStatus}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No trending claims detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Speaker Credibility Reports
              </CardTitle>
              <CardDescription>
                Track accuracy history and credibility scores for public figures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="speaker-select">Select Speaker</Label>
                <Input
                  id="speaker-select"
                  placeholder="Enter speaker name to get credibility report"
                  value={selectedSpeaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value)}
                />
              </div>

              {credibilityQuery.data?.report && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 mr-2" />
                          <span className="font-semibold">{credibilityQuery.data.report.speaker.name}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getCredibilityColor(credibilityQuery.data.report.speaker.credibilityScore)}`}>
                            {(credibilityQuery.data.report.speaker.credibilityScore * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Credibility Score</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold">{credibilityQuery.data.report.speaker.totalStatements}</div>
                          <div className="text-xs text-muted-foreground">Total Statements</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">{credibilityQuery.data.report.speaker.accurateStatements}</div>
                          <div className="text-xs text-muted-foreground">Accurate</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">
                            <Badge variant={credibilityQuery.data.report.accuracyTrend === 'improving' ? 'default' : credibilityQuery.data.report.accuracyTrend === 'declining' ? 'destructive' : 'secondary'}>
                              {credibilityQuery.data.report.accuracyTrend}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">Trend</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {credibilityQuery.data.report.recentStatements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recent Statements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {credibilityQuery.data.report.recentStatements.slice(0, 5).map((stmt: any, index: number) => (
                            <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm">{stmt.statement}</p>
                                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(stmt.checkedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge variant={stmt.isTrue ? 'default' : 'destructive'}>
                                {stmt.isTrue ? 'True' : 'False'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {credibilityQuery.isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading credibility report...</p>
                </div>
              )}

              {selectedSpeaker && !credibilityQuery.data && !credibilityQuery.isLoading && (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No credibility data available for this speaker</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}