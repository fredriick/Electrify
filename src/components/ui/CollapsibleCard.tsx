import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';

export type StatusType = 'verified' | 'pending' | 'rejected' | 'approved' | 'under_review' | 'none';

interface CollapsibleCardProps {
  title: string;
  icon?: React.ReactNode;
  status?: StatusType;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const statusConfig = {
  verified: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-700',
    label: 'Verified'
  },
  pending: {
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    label: 'Pending'
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-700',
    label: 'Approved'
  },
  under_review: {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
    label: 'Under Review'
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-700',
    label: 'Rejected'
  },
  none: {
    icon: null,
    color: '',
    bgColor: '',
    borderColor: '',
    label: ''
  }
};

export function CollapsibleCard({
  title,
  icon,
  status = 'none',
  isOpen = false,
  onToggle,
  children,
  className = ''
}: CollapsibleCardProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  
  const isControlled = onToggle !== undefined;
  const open = isControlled ? isOpen : internalIsOpen;
  
  const handleToggle = () => {
    if (isControlled) {
      onToggle(!open);
    } else {
      setInternalIsOpen(!open);
    }
  };

  const statusInfo = statusConfig[status] || statusConfig.none;
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <button
        onClick={handleToggle}
        className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${
          open 
            ? 'bg-gray-50 dark:bg-gray-700/50' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {status !== 'none' && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
              {StatusIcon && <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />}
              <span className={statusInfo.color}>{statusInfo.label}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      
      {open && (
        <div className="px-6 pb-6">
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {children}
          </div>
        </div>
      )}
    </div>
  );
} 