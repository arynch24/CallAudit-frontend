import React from 'react';

/**
 * Simple markdown parser for basic markdown elements
 */
export const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  let html = text;
  
  // Convert headers (##, ###, etc.)
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-800">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-800">$1</h1>');
  
  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-semibold text-gray-800">$1</strong>');
  
  // Convert italic text
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');
  
  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Convert unordered lists
  html = html.replace(/^\s*[-*+]\s(.+)$/gm, '<li class="ml-4 mb-1">• $1</li>');
  html = html.replace(/(<li[\s\S]*?<\/li>)/, '<ul class="mb-2">$1</ul>');
  
  // Convert ordered lists
  html = html.replace(/^\s*\d+\.\s(.+)$/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>');
  html = html.replace(/(<li class="ml-4 mb-1 list-decimal">[\s\S]*?<\/li>)/, '<ol class="mb-2 ml-4">$1</ol>');
  
  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-2">');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p class="mb-2">${html}</p>`;
  }
  
  return html;
};

/**
 * Component to render parsed markdown content
 */
export const MarkdownContent: React.FC<{ content: string; className?: string }> = ({ 
  content, 
  className = '' 
}) => {
  const parsedContent = parseMarkdown(content);
  
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
};