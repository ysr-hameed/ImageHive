
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { ArrowLeft, Users, MessageSquare, Github, Twitter, MessageCircle } from 'lucide-react';
import Footer from '@/components/footer';

const communityStats = [
  { label: "Active Developers", value: "10,000+" },
  { label: "Monthly Discussions", value: "500+" },
  { label: "GitHub Stars", value: "2,500+" },
  { label: "Countries", value: "50+" }
];

const channels = [
  {
    icon: MessageCircle,
    title: "Discord Server",
    description: "Real-time chat with the community and our team",
    members: "5,000+ members",
    link: "#"
  },
  {
    icon: Github,
    title: "GitHub Discussions",
    description: "Technical discussions and feature requests",
    members: "2,500+ stars",
    link: "#"
  },
  {
    icon: Twitter,
    title: "Twitter Community",
    description: "Latest updates and community highlights",
    members: "3,000+ followers",
    link: "#"
  }
];

const recentPosts = [
  {
    title: "Best practices for image optimization",
    author: "Sarah Chen",
    replies: 15,
    category: "Tips & Tricks"
  },
  {
    title: "Feature request: Batch upload API",
    author: "Mike Rodriguez",
    replies: 8,
    category: "Feature Requests"
  },
  {
    title: "How to handle large image files efficiently",
    author: "Emma Davis",
    replies: 23,
    category: "Technical Discussion"
  },
  {
    title: "ImageVault vs other hosting solutions",
    author: "Alex Johnson",
    replies: 12,
    category: "General"
  }
];

export default function Community() {
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
            Community
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Connect with developers, share knowledge, and build together
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {communityStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="py-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {channels.map((channel, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <channel.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>{channel.title}</CardTitle>
                <CardDescription>{channel.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">{channel.members}</p>
                <Button className="w-full">Join Channel</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Recent Discussions
            </h2>
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{post.title}</CardTitle>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">by {post.author}</span>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-500">{post.replies} replies</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">View All Discussions</Button>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Community Guidelines
            </h2>
            <Card>
              <CardContent className="py-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Be Respectful</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Treat all community members with respect and kindness.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Stay On Topic</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Keep discussions relevant to ImageVault and web development.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Help Others</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Share your knowledge and help fellow developers succeed.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">No Spam</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Avoid self-promotion and off-topic advertising.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Become a Community Leader</CardTitle>
                <CardDescription>
                  Help moderate discussions and mentor new developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Apply to Moderate</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
