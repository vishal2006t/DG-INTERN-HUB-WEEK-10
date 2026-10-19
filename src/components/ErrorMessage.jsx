import React from 'react';
import { AlertCircle, AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';
import Button from './Button';

const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'We encountered an error while communicating with the server. Please check your connection and try again.',
  onRetry = null,
  actionText = 'Try Again',
  type = 'error',
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={32} className="error-icon text-warning" />;
      case 'empty':
        return <HelpCircle size={32} className="error-icon text-muted" />;
      default:
        return <AlertCircle size={32} className="error-icon text-danger" />;
    }
  };

  return (
    <div className={`error-card-state ${type}-state ${className}`} role="alert">
      <div className="error-icon-wrap">
        {getIcon()}
      </div>
      <div className="error-content">
        <h3 className="error-title">{title}</h3>
        <p className="error-description">{message}</p>
        {onRetry && (
          <div className="error-actions">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={onRetry}
            >
              {actionText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
