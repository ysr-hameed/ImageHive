import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/theme-provider';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart3,
  Upload,
  Image as ImageIcon,
  Key,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  Users,
  Database,
  ChevronUp,
  Zap,
  FileImage,
  Folder,
  Star,
  Clock,
  Activity,
  UserIcon,
  CreditCard,
} from 'lucide-react';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: BarChart3,
    },
    {
      title: 'Images',
      url: '/images',
      icon: ImageIcon,
    },
    {
      title: 'Upload',
      url: '/upload',
      icon: Upload,
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: Activity,
    },
    {
      title: 'API Keys',
      url: '/api-keys',
      icon: Key,
    },
    {
      title: 'API Docs',
      url: '/docs',
      icon: FileImage,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
  ],
};

export function AppSidebar() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/auth/logout', {});
    },
    onSettled: () => {
      // Force a full page reload to clear all state
      window.location.href = '/';
    }
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'starter':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'pro':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'enterprise':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <Sidebar collapsible="icon" className="bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-1 py-2 text-left text-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-brand-500 to-emerald-500 text-white">
            <FileImage className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-lg">ImageVault</span>
            <span className="truncate text-xs text-sidebar-foreground/70 mt-1">
              {user?.plan || 'Free'} Plan
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu className="space-y-1">
              {data.navMain.map((item) => {
                const isActive = location === item.url || (item.url !== '/' && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} className="h-10 px-3 py-2">
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span className="ml-3">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.isAdmin && (
          <>
            <SidebarSeparator className="my-4" />
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1">
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/admin'} className="h-10 px-3 py-2">
                      <Link href="/admin">
                        <Shield className="h-4 w-4" />
                        <span className="ml-3">Admin Panel</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          {/* Current Plan Display */}
          {user?.plan && (
            <SidebarMenuItem>
              <div className="px-3 py-2 mb-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Plan</div>
                <Badge className={`${getPlanColor(user.plan)} text-xs w-full justify-center`}>
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                </Badge>
              </div>
            </SidebarMenuItem>
          )}

          {/* Plan Upgrade Button */}
          {user?.plan !== 'enterprise' && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-10 px-3 py-2">
                <Link href="/plans">
                  <Zap className="h-4 w-4" />
                  <span className="ml-3">Upgrade Plan</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="!h-auto !p-3">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                    <UserIcon className="size-4" />
                  </div>
                  <ChevronUp className="ml-auto transition-transform duration-200 group-data-[state=open]/menu-button:rotate-180" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="right"
                align="start"
                forceMount
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <UserIcon className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/settings" className="cursor-pointer">
                    <Settings className="size-4 mr-2" />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/profile" className="cursor-pointer">
                    <UserIcon className="size-4 mr-2" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/plans" className="cursor-pointer">
                    <CreditCard className="size-4 mr-2" />
                    Billing
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="size-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}