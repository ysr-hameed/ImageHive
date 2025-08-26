
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Footer from '@/components/footer';

const services = [
  {
    name: "Image Upload API",
    status: "operational",
    uptime: "99.9%"
  },
  {
    name: "Image Delivery CDN",
    status: "operational",
    uptime: "99.95%"
  },
  {
    name: "Dashboard",
    status: "operational",
    uptime: "99.8%"
  },
  {
    name: "Authentication",
    status: "operational",
    uptime: "99.9%"
  }
];

const incidents = [
  {
    title: "Scheduled Maintenance - Database Upgrade",
    status: "completed",
    date: "December 1, 2024",
    duration: "30 minutes",
    description: "Routine database maintenance completed successfully with no service interruption."
  },
  {
    title: "Brief CDN Latency Issue",
    status: "resolved",
    date: "November 28, 2024",
    duration: "15 minutes",
    description: "Temporary increased response times on our European CDN nodes. Resolved by routing traffic to alternative nodes."
  },
  {
    title: "API Rate Limiting Issue",
    status: "resolved",
    date: "November 25, 2024",
    duration: "45 minutes",
    description: "Some users experienced unexpected rate limiting. Fixed by adjusting rate limit configurations."
  }
];

const metrics = [
  {
    name: "Average Response Time",
    value: "45ms",
    trend: "good"
  },
  {
    name: "Upload Success Rate",
    value: "99.97%",
    trend: "good"
  },
  {
    name: "API Uptime",
    value: "99.95%",
    trend: "good"
  },
  {
    name: "Global Coverage",
    value: "200+ locations",
    trend: "good"
  }
];

export default function Status() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            System Status
          </h1>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-xl text-green-600 font-medium">All Systems Operational</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Service Status
            </h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{service.name}</h3>
                          <p className="text-sm text-gray-500">Uptime: {service.uptime}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Operational
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Performance Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="py-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-500">{metric.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Incidents
          </h2>
          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">{incident.date}</span>
                        </div>
                        <span className="text-sm text-gray-500">Duration: {incident.duration}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={incident.status === 'completed' ? 'secondary' : 'default'}
                      className={incident.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {incident.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{incident.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Subscribe to get notifications about service updates and incidents
          </p>
          <Button size="lg">Subscribe to Updates</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
