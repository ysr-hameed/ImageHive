import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MoreHorizontal, 
  Grid3X3,
  List,
  Image as ImageIcon,
  BarChart3
} from "lucide-react";

const sampleImages = [
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    alt: "Mountain landscape",
    name: "mountain-landscape.jpg",
    size: "2.4 MB",
    privacy: "Public"
  },
  {
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    alt: "Urban cityscape",
    name: "city-skyline.jpg",
    size: "1.8 MB",
    privacy: "Private"
  },
  {
    url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    alt: "Tropical beach",
    name: "beach-paradise.jpg",
    size: "3.1 MB",
    privacy: "Public"
  },
  {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    alt: "Office workspace",
    name: "workspace-setup.jpg",
    size: "1.2 MB",
    privacy: "Public"
  },
];

export default function DashboardPreview() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Powerful Dashboard & File Manager
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Manage your images with an intuitive interface designed for both developers and content creators.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Dashboard Header */}
          <div className="bg-gray-50 dark:bg-slate-700 px-6 py-4 border-b border-gray-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Dashboard
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button data-testid="button-upload-demo">
                  Upload Images
                </Button>
                <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Dashboard Navigation */}
          <Tabs defaultValue="images" className="w-full">
            <div className="border-b border-gray-200 dark:border-slate-600">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
                <TabsTrigger 
                  value="images" 
                  className="px-6 py-3 border-b-2 border-transparent data-[state=active]:border-brand-500 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400 rounded-none"
                >
                  Images
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="px-6 py-3 border-b-2 border-transparent data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400 rounded-none"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="api-keys" 
                  className="px-6 py-3 border-b-2 border-transparent data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400 rounded-none"
                >
                  API Keys
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="px-6 py-3 border-b-2 border-transparent data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400 rounded-none"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="images" className="p-0 m-0">
              {/* Stats Row */}
              <div className="p-6 border-b border-gray-200 dark:border-slate-600">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-4" data-testid="stat-total-images">
                    <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">1,247</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Images</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4" data-testid="stat-storage-used">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">24.3GB</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Storage Used</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4" data-testid="stat-total-views">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">456K</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4" data-testid="stat-cache-hit-rate">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">89.2%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
                  </div>
                </div>
              </div>

              {/* File Manager Grid */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Images
                    </h3>
                    <select className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                      <option>All Images</option>
                      <option>Public</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-brand-600 dark:text-brand-400">
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sampleImages.map((image, index) => (
                    <div key={index} className="group cursor-pointer" data-testid={`image-item-${index}`}>
                      <div className="relative aspect-square bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={image.alt} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute top-2 right-2">
                            <Button variant="ghost" size="sm" className="p-1.5 bg-white/90 hover:bg-white rounded-lg">
                              <MoreHorizontal className="w-4 h-4 text-gray-700" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-white/90 rounded-lg p-2">
                              <div className="text-xs font-medium text-gray-900 truncate">
                                {image.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {image.size} • {image.privacy}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed analytics and insights would be displayed here.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="api-keys" className="p-6">
              <div className="text-center py-12">
                <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">API Key Management</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Create and manage your API keys for programmatic access.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <div className="text-center py-12">
                <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">Account Settings</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your account preferences and configuration.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
