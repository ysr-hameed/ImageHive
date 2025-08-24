import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Database, 
  Zap, 
  CheckCircle,
  AlertCircle,
  BarChart3
} from "lucide-react";

const mockLogs = [
  {
    id: 1,
    level: "info",
    message: "Image upload successful: img_abc123.jpg",
    timestamp: "2024-01-15T14:32:15Z",
    userId: "user_123"
  },
  {
    id: 2,
    level: "warn", 
    message: "Rate limit approaching for API key xxx1234",
    timestamp: "2024-01-15T14:31:42Z",
    userId: "user_456"
  },
  {
    id: 3,
    level: "info",
    message: "CDN cache invalidated for domain: cdn.example.com",
    timestamp: "2024-01-15T14:30:28Z"
  },
  {
    id: 4,
    level: "error",
    message: "Failed to process image: invalid format",
    timestamp: "2024-01-15T14:29:15Z",
    userId: "user_789"
  },
  {
    id: 5,
    level: "info",
    message: "New API key generated for user_789",
    timestamp: "2024-01-15T14:28:03Z",
    userId: "user_789"
  },
  {
    id: 6,
    level: "info",
    message: "Backup completed: 847TB transferred",
    timestamp: "2024-01-15T14:27:21Z"
  }
];

const getLogLevelColor = (level: string) => {
  switch (level) {
    case 'error': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    case 'warn': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
    case 'info': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  }
};

const getLogIcon = (level: string) => {
  switch (level) {
    case 'error': return AlertCircle;
    case 'warn': return AlertCircle;
    default: return CheckCircle;
  }
};

export default function AdminPanelPreview() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Comprehensive Admin Panel
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Monitor usage, manage users, and track performance with detailed logs and analytics.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Admin Header */}
          <div className="bg-gray-900 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold">Admin Dashboard</h3>
                <Badge className="bg-emerald-600 text-white border-emerald-600">
                  Live
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-300">Last updated: 2 min ago</div>
                <div className="w-8 h-8 bg-white/20 rounded-full" data-testid="admin-avatar"></div>
              </div>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4" data-testid="admin-stat-users">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24,567</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +12% this month
                </div>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4" data-testid="admin-stat-storage">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">847TB</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Storage Used</div>
                  </div>
                  <Database className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +8% this week
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4" data-testid="admin-stat-requests">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">1.2M</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">API Requests/hr</div>
                  </div>
                  <Zap className="w-8 h-8 text-amber-500" />
                </div>
                <div className="mt-2 text-xs text-red-500">
                  -3% from yesterday
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4" data-testid="admin-stat-uptime">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">99.98%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Above SLA
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Logs */}
          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg" data-testid="activity-new-user">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">New user registration</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">user@example.com • 2 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg" data-testid="activity-rate-limit">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">API rate limit exceeded</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">api_key_xxx1234 • 5 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg" data-testid="activity-storage-warning">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Storage quota warning</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">user_pro_123 • 12 minutes ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Logs */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Logs</h4>
                <div className="bg-gray-900 dark:bg-slate-700 rounded-lg p-4 font-mono text-sm text-green-400 h-40 overflow-y-auto">
                  <div className="space-y-1">
                    {mockLogs.map((log) => {
                      const Icon = getLogIcon(log.level);
                      return (
                        <div key={log.id} className="flex items-start space-x-2 text-xs" data-testid={`log-${log.id}`}>
                          <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-400">[{log.level.toUpperCase()}]</span>
                            <span className="text-gray-500 ml-2">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-green-400 ml-2">-</span>
                            <span className="text-green-400 ml-2">{log.message}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
