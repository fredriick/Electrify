'use client';

import { useState, useEffect } from 'react';
import { SuperAdminLayout } from '@/components/super-admin/SuperAdminLayout';
import { 
  BarChart3, 
  Users, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  FileText, 
  PieChart,
  Activity,
  Shield,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  Globe,
  Database,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Star,
  Crown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
  Key,
  Bell
} from 'lucide-react';

interface ReportData {
  id: string;
  name: string;
  type: 'user_analytics' | 'activity_summary' | 'security_report' | 'role_distribution' | 'login_statistics' | 'geographic_data';
  description: string;
  lastGenerated: string;
  nextScheduled: string;
  status: 'ready' | 'generating' | 'failed';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  size: string;
  downloadCount: number;
  isScheduled: boolean;
  schedule: string;
  recipients: string[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
  }[];
}

export default function UserReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Mock reports data
  const mockReports: ReportData[] = [
    {
      id: '1',
      name: 'User Analytics Report',
      type: 'user_analytics',
      description: 'Comprehensive analysis of user behavior and engagement metrics',
      lastGenerated: '2024-01-15 10:30:00',
      nextScheduled: '2024-01-16 10:30:00',
      status: 'ready',
      format: 'pdf',
      size: '2.4 MB',
      downloadCount: 15,
      isScheduled: true,
      schedule: 'Daily at 10:30 AM',
      recipients: ['admin@company.com', 'analytics@company.com']
    },
    {
      id: '2',
      name: 'Activity Summary Report',
      type: 'activity_summary',
      description: 'Summary of user activities and system usage patterns',
      lastGenerated: '2024-01-15 09:00:00',
      nextScheduled: '2024-01-16 09:00:00',
      status: 'ready',
      format: 'csv',
      size: '1.8 MB',
      downloadCount: 8,
      isScheduled: true,
      schedule: 'Daily at 9:00 AM',
      recipients: ['admin@company.com']
    },
    {
      id: '3',
      name: 'Security Report',
      type: 'security_report',
      description: 'Security incidents and threat analysis report',
      lastGenerated: '2024-01-15 08:00:00',
      nextScheduled: '2024-01-16 08:00:00',
      status: 'ready',
      format: 'pdf',
      size: '3.2 MB',
      downloadCount: 12,
      isScheduled: true,
      schedule: 'Daily at 8:00 AM',
      recipients: ['security@company.com', 'admin@company.com']
    },
    {
      id: '4',
      name: 'Role Distribution Report',
      type: 'role_distribution',
      description: 'Analysis of user roles and permissions distribution',
      lastGenerated: '2024-01-14 18:00:00',
      nextScheduled: '2024-01-15 18:00:00',
      status: 'ready',
      format: 'excel',
      size: '1.5 MB',
      downloadCount: 6,
      isScheduled: true,
      schedule: 'Daily at 6:00 PM',
      recipients: ['hr@company.com', 'admin@company.com']
    },
    {
      id: '5',
      name: 'Login Statistics Report',
      type: 'login_statistics',
      description: 'Detailed login patterns and authentication statistics',
      lastGenerated: '2024-01-15 07:00:00',
      nextScheduled: '2024-01-16 07:00:00',
      status: 'generating',
      format: 'csv',
      size: '2.1 MB',
      downloadCount: 10,
      isScheduled: true,
      schedule: 'Daily at 7:00 AM',
      recipients: ['admin@company.com']
    },
    {
      id: '6',
      name: 'Geographic Data Report',
      type: 'geographic_data',
      description: 'User activity by geographic location and time zones',
      lastGenerated: '2024-01-14 20:00:00',
      nextScheduled: '2024-01-15 20:00:00',
      status: 'ready',
      format: 'json',
      size: '4.7 MB',
      downloadCount: 3,
      isScheduled: true,
      schedule: 'Daily at 8:00 PM',
      recipients: ['analytics@company.com']
    }
  ];

  // Mock chart data
  const userGrowthData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Active Users',
      data: [120, 135, 142, 158, 165, 178, 185, 192, 201, 215, 228, 245],
      backgroundColor: ['rgba(147, 51, 234, 0.2)'],
      borderColor: ['rgba(147, 51, 234, 1)']
    }]
  };

  const roleDistributionData: ChartData = {
    labels: ['Super Admin', 'Admin', 'Manager', 'User', 'Guest'],
    datasets: [{
      label: 'Users by Role',
      data: [1, 3, 8, 45, 12],
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(107, 114, 128, 0.8)'
      ],
      borderColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(107, 114, 128, 1)'
      ]
    }]
  };

  const activityData: ChartData = {
    labels: ['Login', 'Data Access', 'System Changes', 'Profile Updates', 'Admin Actions'],
    datasets: [{
      label: 'Activity Count',
      data: [1247, 892, 156, 234, 89],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(147, 51, 234, 1)',
        'rgba(239, 68, 68, 1)'
      ]
    }]
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setReports(mockReports);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'user_analytics':
        return <BarChart3 className="w-4 h-4" />;
      case 'activity_summary':
        return <Activity className="w-4 h-4" />;
      case 'security_report':
        return <Shield className="w-4 h-4" />;
      case 'role_distribution':
        return <Users className="w-4 h-4" />;
      case 'login_statistics':
        return <UserCheck className="w-4 h-4" />;
      case 'geographic_data':
        return <MapPin className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'generating':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'generating':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'csv':
        return <BarChart3 className="w-4 h-4" />;
      case 'excel':
        return <BarChart3 className="w-4 h-4" />;
      case 'json':
        return <Database className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleReportAction = (report: ReportData, action: string) => {
    switch (action) {
      case 'download':
        // Simulate download
        console.log(`Downloading ${report.name}`);
        break;
      case 'edit':
        setSelectedReport(report);
        setShowReportModal(true);
        break;
      case 'regenerate':
        setReports(prev => prev.map(r => 
          r.id === report.id ? { ...r, status: 'generating' as const } : r
        ));
        // Simulate regeneration
        setTimeout(() => {
          setReports(prev => prev.map(r => 
            r.id === report.id ? { ...r, status: 'ready' as const } : r
          ));
        }, 3000);
        break;
      case 'delete':
        setReports(prev => prev.filter(r => r.id !== report.id));
        break;
    }
  };

  const generateNewReport = () => {
    const newReport: ReportData = {
      id: Date.now().toString(),
      name: 'New Custom Report',
      type: 'user_analytics',
      description: 'Custom report generated by user',
      lastGenerated: new Date().toISOString(),
      nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'generating',
      format: 'pdf',
      size: '0 KB',
      downloadCount: 0,
      isScheduled: false,
      schedule: 'Manual',
      recipients: []
    };
    setReports(prev => [newReport, ...prev]);
    
    // Simulate generation
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReport.id ? { ...r, status: 'ready' as const, size: '1.2 MB' } : r
      ));
    }, 2000);
  };

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                User Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Generate and manage user analytics reports
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={generateNewReport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reports.filter(r => r.status === 'ready').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled Reports</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reports.filter(r => r.isScheduled).length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {reports.reduce((sum, r) => sum + r.downloadCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Download className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Report Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        {getReportIcon(report.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {report.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span className="ml-1 capitalize">{report.status}</span>
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {report.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Format:</span>
                      <span className="text-gray-900 dark:text-white ml-1 uppercase">{report.format}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Size:</span>
                      <span className="text-gray-900 dark:text-white ml-1">{report.size}</span>
                    </div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Generated:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(report.lastGenerated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Next Scheduled:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(report.nextScheduled).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Downloads:</span>
                      <span className="text-gray-900 dark:text-white">{report.downloadCount}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {report.isScheduled && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        <Calendar className="w-3 h-3 mr-1" />
                        Scheduled
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {getFormatIcon(report.format)}
                      <span className="ml-1 uppercase">{report.format}</span>
                    </span>
                  </div>

                  {report.recipients.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Recipients:</h4>
                      <div className="flex flex-wrap gap-1">
                        {report.recipients.map((recipient) => (
                          <span key={recipient} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            {recipient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Report Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {report.status === 'ready' && (
                        <button
                          onClick={() => handleReportAction(report, 'download')}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {report.status === 'failed' && (
                        <button
                          onClick={() => handleReportAction(report, 'regenerate')}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg"
                          title="Regenerate Report"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReportAction(report, 'edit')}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" 
                        title="Edit Report"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleReportAction(report, 'delete')}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg" 
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {reports.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No reports found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Generate your first report to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
} 