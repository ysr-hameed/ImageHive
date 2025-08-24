import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Folder,
  Plus,
  Search,
  Image as ImageIcon,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Share,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';

export default function Collections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['/api/v1/collections'],
    retry: false,
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/v1/collections', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/collections'] });
      setShowCreateDialog(false);
      setNewCollection({ name: '', description: '', isPublic: false });
      toast({
        title: 'Success',
        description: 'Collection created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive',
      });
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      await apiRequest('DELETE', `/api/v1/collections/${collectionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/collections'] });
      toast({
        title: 'Success',
        description: 'Collection deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete collection',
        variant: 'destructive',
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredCollections = (collections as any[]).filter((collection: any) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Folder className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Collections
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Organize your images into collections
              </p>
            </div>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Collection Name</Label>
                  <Input
                    id="name"
                    value={newCollection.name}
                    onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                    placeholder="Enter collection name..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newCollection.description}
                    onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                    placeholder="Describe your collection..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => createCollectionMutation.mutate(newCollection)}
                    disabled={!newCollection.name || createCollectionMutation.isPending}
                  >
                    Create Collection
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Collections Grid */}
        {filteredCollections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No matching collections' : 'No collections yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first collection to organize your images'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Collection
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection: any) => (
              <Card key={collection.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Folder className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                          {collection.name}
                        </h3>
                        <Badge variant={collection.isPublic ? "default" : "secondary"} className="text-xs">
                          {collection.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
                              deleteCollectionMutation.mutate(collection.id);
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {collection.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    {/* Preview Images */}
                    <div className="grid grid-cols-3 gap-1 h-20">
                      {collection.previewImages?.slice(0, 3).map((image: any, index: number) => (
                        <div key={index} className="bg-gray-100 dark:bg-slate-800 rounded overflow-hidden">
                          <img
                            src={image.cdnUrl}
                            alt={image.originalName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )) || (
                        [...Array(3)].map((_, index) => (
                          <div key={index} className="bg-gray-100 dark:bg-slate-800 rounded flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          {collection.imageCount || 0} images
                        </span>
                        {collection.viewCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {collection.viewCount} views
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      Created {formatDate(collection.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}