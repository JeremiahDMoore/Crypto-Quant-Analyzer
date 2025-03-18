import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { NewsItem } from '../types';
import { format } from 'date-fns';

interface Props {
  news: NewsItem[];
}

export function NewsPanel({ news }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Latest News</h2>
      <div className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink size={20} />
              </a>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              {format(new Date(item.publishedAt), 'MMM d, yyyy HH:mm')}
            </p>
            <p className="text-gray-700 mt-2">{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}