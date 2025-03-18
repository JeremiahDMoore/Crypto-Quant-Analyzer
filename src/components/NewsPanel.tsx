import React from 'react';
import type { NewsItem } from '../types';

interface NewsPanelProps {
  news: NewsItem[];
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ news }) => {
  return (
    <div className="space-y-4">
      {news.map((item, index) => (
        <a 
          key={index} 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block bg-white p-4 rounded-lg shadow hover:bg-gray-200 transition-colors"
        >
          <h3 className="text-xl font-semibold text-blue-600">{item.title}</h3>
          <p className="mt-2 text-gray-700">{item.summary}</p>
        </a>
      ))}
    </div>
  );
};