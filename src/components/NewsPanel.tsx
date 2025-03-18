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
          className="block bg-surface p-4 rounded-lg shadow hover:bg-border transition-colors"
        >
          <h3 className="text-xl font-semibold text-primary">{item.title}</h3>
          <p className="mt-2 text-text">{item.summary}</p>
        </a>
      ))}
    </div>
  );
};