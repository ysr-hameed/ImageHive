import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Clock, Zap } from "lucide-react";

export default function ApiUsage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Usage</h1>
        <p className="text-muted-foreground">
          Monitor your API usage, rate limits, and performance metrics.
        </p>
      </div>

      {/* Usage Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89ms</div>
            <p className="text-xs text-muted-foreground">
              -5ms from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">
              +0.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limits */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Usage Limits</CardTitle>
            <CardDescription>
              Your current plan limits and usage for this billing period.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Requests</span>
                <span className="text-sm text-muted-foreground">2,350 / 10,000</span>
              </div>
              <Progress value={23.5} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage Used</span>
                <span className="text-sm text-muted-foreground">1.2 GB / 5 GB</span>
              </div>
              <Progress value={24} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bandwidth</span>
                <span className="text-sm text-muted-foreground">45 GB / 100 GB</span>
              </div>
              <Progress value={45} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Limits</CardTitle>
            <CardDescription>
              Current rate limiting status and windows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Per Minute</span>
              <Badge variant="secondary">100 requests</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Per Hour</span>
              <Badge variant="secondary">1,000 requests</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Upload Size</span>
              <Badge variant="secondary">50 MB max</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status</span>
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Error Analysis</CardTitle>
          <CardDescription>
            Recent errors and their frequency over the past 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Authentication Errors (401)</p>
                <p className="text-xs text-muted-foreground">Invalid or missing API key</p>
              </div>
              <Badge variant="outline">3 occurrences</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Rate Limit Exceeded (429)</p>
                <p className="text-xs text-muted-foreground">Too many requests in time window</p>
              </div>
              <Badge variant="outline">1 occurrence</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">File Too Large (413)</p>
                <p className="text-xs text-muted-foreground">Upload exceeded size limit</p>
              </div>
              <Badge variant="outline">2 occurrences</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Detailed performance breakdown for your API requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">89ms</div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">45ms</div>
              <p className="text-sm text-muted-foreground">P95 Response</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}