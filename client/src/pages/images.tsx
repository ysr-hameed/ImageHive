import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedImageGrid from '@/components/enhanced-image-grid';
import { 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Filter, 
  Grid3X3,
  List,
  Star,
  Clock,
  Folder,
  Plus,
} from 'lucide-react';
import { Link } from 'wouter';

export default function Images() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: imagesData = {}, isLoading } = useQuery({
    queryKey: ['/api/v1/images', activeTab, searchQuery],
    retry: false,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['/api/v1/collections'],
    retry: false,
  });

  const filterImages = (images: any[], filter: string) => {
    if (!Array.isArray(images)) return [];
    
    switch (filter) {
      case 'recent':
        return images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);
      case 'favorites':
        return images.filter(img => img.isFavorite);
      case 'public':
        return images.filter(img => img.privacy === 'public');
      case 'private':
        return images.filter(img => img.privacy === 'private');
      default:
        return images;
    }
  };

  const filteredImages = filterImages((imagesData as any)?.images || [], activeTab);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Images
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your uploaded images and collections
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/images/collections">
                <Plus className="w-4 h-4 mr-2" />
                New Collection
              </Link>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(imagesData as any)?.total || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredImages.filter(img => img.isFavorite).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Folder className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Collections</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(collections as any[]).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filteredImages.filter(img => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(img.createdAt) > weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Images</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Images ({(imagesData as any)?.total || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <EnhancedImageGrid images={filteredImages} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Images</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedImageGrid images={filteredImages} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Images</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedImageGrid images={filteredImages} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="public">
            <Card>
              <CardHeader>
                <CardTitle>Public Images</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedImageGrid images={filteredImages} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="private">
            <Card>
              <CardHeader>
                <CardTitle>Private Images</CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedImageGrid images={filteredImages} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}