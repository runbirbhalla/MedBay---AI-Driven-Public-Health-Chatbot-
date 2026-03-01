'use client';

import ReactMarkdown from 'react-markdown';
import { Volume2, X } from 'lucide-react';

export default function MessageBubble({ message, onSpeak, isSpeaking }) {
  const isUser = message.sender === 'user';
  
  // Base classes for the message bubble
  const bubbleClasses = `max-w-xs md:max-w-md p-3 rounded-2xl relative ${
    isUser
      ? 'bg-blue-500 text-white rounded-br-none'
      : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
  }`;

  // Styles for Markdown, with padding to make space for the button
  const markdownStyles = `
    prose prose-sm dark:prose-invert
    prose-p:my-1 prose-headings:my-2 prose-ul:my-1
    whitespace-pre-wrap
    pr-8 
  `;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={bubbleClasses}>
        <div className={markdownStyles}>
            <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
        {/* Speaker button is now inside the bubble and always visible for bot messages */}
        {!isUser && message.text && (
            <button 
                onClick={() => onSpeak(message)}
                className="cursor-pointer absolute bottom-2 right-2 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                aria-label="Read message aloud"
            >
                {isSpeaking ? <X size={14} /> : <Volume2 size={14} />}
            </button>
        )}
      </div>
    </div>
  );
}

