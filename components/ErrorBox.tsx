import { AlertCircle } from "lucide-react";

interface ErrorProps {
    message: string;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
    onRetry?: () => void;
    retryText?: string;
}

const Error: React.FC<ErrorProps> = ({
    message,
    title = 'Error',
    size = 'md',
    onRetry,
    retryText = 'Try Again'
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const titleSizeClasses = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl'
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-3">
            <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className={sizeClasses[size]} />
                <span className={`${titleSizeClasses[size]} font-medium`}>{title}</span>
            </div>
            <p className={`${textSizeClasses[size]} text-red-600 text-center max-w-md`}>
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-3 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                    {retryText}
                </button>
            )}
        </div>
    );
};

export default Error;