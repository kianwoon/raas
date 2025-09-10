import { JobStatus } from '@/types/common';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '⏳'
        };
      case JobStatus.RUNNING:
        return {
          label: 'Running',
          color: 'bg-blue-100 text-blue-800',
          icon: '🔄'
        };
      case JobStatus.COMPLETED:
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-800',
          icon: '✅'
        };
      case JobStatus.FAILED:
        return {
          label: 'Failed',
          color: 'bg-red-100 text-red-800',
          icon: '❌'
        };
      case JobStatus.CANCELLED:
        return {
          label: 'Cancelled',
          color: 'bg-gray-100 text-gray-800',
          icon: '🚫'
        };
      case JobStatus.TIMEOUT:
        return {
          label: 'Timeout',
          color: 'bg-orange-100 text-orange-800',
          icon: '⏰'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      config.color,
      className
    )}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}