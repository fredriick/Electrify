'use client';
import { useState } from 'react';
import { 
  Wrench, 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  LogOut
} from 'lucide-react';

interface InstallationJob {
  id: string;
  customerName: string;
  address: string;
  systemType: string;
  estimatedHours: number;
  hourlyRate: number;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed';
  requestedDate: string;
  description: string;
}

export default function InstallerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'profile'>('overview');

  // Mock installer data
  const installerData = {
    companyName: 'SunPower Installations',
    contactPerson: 'John Smith',
    email: 'john@sunpowerinstallations.com',
    phone: '(555) 123-4567',
    address: '123 Solar Street',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85001',
    licenseNumber: 'AZ-123456',
    insuranceNumber: 'INS-789012',
    experience: '5-10 years',
    specialties: ['Residential Solar', 'Solar Panels', 'Battery Storage', 'System Design'],
    rating: 4.8,
    completedJobs: 127,
    totalEarnings: 45600
  };

  // Mock installation jobs
  const installationJobs: InstallationJob[] = [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      address: '456 Green Ave, Phoenix, AZ 85002',
      systemType: 'Residential Solar Panel Installation',
      estimatedHours: 8,
      hourlyRate: 75,
      status: 'pending',
      requestedDate: '2024-01-15',
      description: '5kW residential solar panel installation with battery backup system'
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      address: '789 Renewable Blvd, Phoenix, AZ 85003',
      systemType: 'Commercial Solar Installation',
      estimatedHours: 24,
      hourlyRate: 85,
      status: 'accepted',
      requestedDate: '2024-01-20',
      description: '25kW commercial solar installation for office building'
    },
    {
      id: '3',
      customerName: 'Lisa Rodriguez',
      address: '321 Solar Way, Phoenix, AZ 85004',
      systemType: 'Residential Solar + Battery',
      estimatedHours: 12,
      hourlyRate: 80,
      status: 'in-progress',
      requestedDate: '2024-01-18',
      description: '8kW residential system with Tesla Powerwall installation'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'accepted': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'in-progress': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Installer Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex space-x-8 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Installation Jobs
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${installerData.totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Jobs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {installerData.completedJobs}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {installerData.rating}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {installationJobs.filter(job => job.status === 'in-progress').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Installation Jobs</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {installationJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{job.customerName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{job.address}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{job.systemType}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          {job.status.replace('-', ' ')}
                        </span>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">${job.hourlyRate}/hr</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{job.estimatedHours}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Installation Jobs</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {installationJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{job.customerName}</h4>
                          <p className="text-gray-600 dark:text-gray-400">{job.address}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          {job.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">System Type</p>
                          <p className="text-gray-900 dark:text-white">{job.systemType}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested Date</p>
                          <p className="text-gray-900 dark:text-white">{new Date(job.requestedDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Hours</p>
                          <p className="text-gray-900 dark:text-white">{job.estimatedHours} hours</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Hourly Rate</p>
                          <p className="text-gray-900 dark:text-white">${job.hourlyRate}/hour</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</p>
                        <p className="text-gray-900 dark:text-white">{job.description}</p>
                      </div>
                      
                      <div className="flex gap-3">
                        {job.status === 'pending' && (
                          <>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                              Accept Job
                            </button>
                            <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white rounded-lg font-medium transition-colors">
                              Decline
                            </button>
                          </>
                        )}
                        {job.status === 'accepted' && (
                          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                            Start Installation
                          </button>
                        )}
                        {job.status === 'in-progress' && (
                          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Profile</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Company Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{installerData.companyName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{installerData.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{installerData.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{installerData.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {installerData.address}, {installerData.city}, {installerData.state} {installerData.zipCode}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">Licenses & Certifications</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Contractor License</p>
                        <p className="text-gray-900 dark:text-white">{installerData.licenseNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Insurance Policy</p>
                        <p className="text-gray-900 dark:text-white">{installerData.insuranceNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience</p>
                        <p className="text-gray-900 dark:text-white">{installerData.experience}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {installerData.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Edit Profile
                  </button>
                  <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white rounded-lg font-medium transition-colors">
                    View Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 