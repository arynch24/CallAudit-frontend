import React from 'react';
import { X } from 'lucide-react';
import { MarkdownContent } from '../../utils/parseMarkdown';

interface ExpandableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  isMarkdown?: boolean;
}

const ExpandableDialog: React.FC<ExpandableDialogProps> = ({
  isOpen,
  onClose,
  title,
  content,
  isMarkdown = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isMarkdown ? (
            <MarkdownContent 
              content={content}
              className="text-sm text-gray-700 leading-relaxed"
            />
          ) : (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpandableDialog;