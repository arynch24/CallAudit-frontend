import { Loader2 } from 'lucide-react';

// Loader Component
interface LoaderProps {
    text?: string;
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'gray' | 'green' | 'purple';
}

const Loader: React.FC<LoaderProps> = ({
    text = 'Loading...',
    size = 'lg',
    color = 'blue'
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

    const colorClasses = {
        blue: 'text-blue-500',
        gray: 'text-gray-500',
        green: 'text-green-500',
        purple: 'text-purple-500'
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-3">
            <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
            <span className={`${textSizeClasses[size]} text-gray-600`}>{text}</span>
        </div>
    );
};


export default Loader;