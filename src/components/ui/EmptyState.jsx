import { Inbox } from 'lucide-react';

const EmptyState = ({ icon, title = 'No data found', description, action, className = '' }) => {
  const Icon = icon || Inbox;

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
