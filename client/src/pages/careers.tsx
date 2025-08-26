
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ArrowLeft, MapPin, Clock, Users } from 'lucide-react';
import Footer from '@/components/footer';

const openings = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Help us build the next generation of our React-based dashboard and developer tools."
  },
  {
    title: "Backend Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    description: "Work on our high-performance image processing and API infrastructure."
  },
  {
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    description: "Scale our global infrastructure and improve deployment processes."
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "New York, NY",
    type: "Full-time",
    description: "Design intuitive experiences for developers and end users."
  }
];

export default function Careers() {
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
            Careers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Join our mission to revolutionize image hosting for developers
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Remote First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Work from anywhere in the world. We believe talent is global.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Flexible Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose your own hours and maintain a healthy work-life balance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Global Team</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Collaborate with talented people from around the world.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Open Positions
          </h2>
          <div className="space-y-6">
            {openings.map((job, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-2">{job.title}</CardTitle>
                      <CardDescription>{job.description}</CardDescription>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary">{job.department}</Badge>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{job.type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Don't see a perfect fit?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            We're always looking for talented people. Send us your resume.
          </p>
          <Button size="lg">Send Resume</Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
