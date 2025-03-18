import React from 'react';
import type { NewsItem } from '../types';

interface NewsPanelProps {
  news: NewsItem[];
}

const groupNews = (news: NewsItem[]) => {
  const cryptoNews = news.filter(item => item.source === 'CoinGecko Trends');
  const macroNews = news.filter(item => item.source !== 'CoinGecko Trends');
  return { cryptoNews, macroNews };
};

export const NewsPanel: React.FC<NewsPanelProps> = ({ news }) => {
  const { cryptoNews, macroNews } = groupNews(news);
  return (
    <div className="space-y-8">
      {cryptoNews.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text mb-4">Crypto News</h2>
          <div className="space-y-4">
            {cryptoNews.map((item, index) => (
              <a 
                key={index} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block bg-surface p-4 rounded-lg shadow hover:bg-border transition-colors"
              >
                <h3 className="text-xl font-semibold text-primary">{item.title}</h3>
                <div className="text-sm text-gray-500">
                  {item.source} - {new Date(item.publishedAt).toLocaleString()}
                </div>
                <p className="mt-2 text-text">
                  {item.summary || "No summary provided."}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
      {macroNews.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-text mb-4">Macro Economic News</h2>
          <div className="space-y-4">
            {macroNews.map((item, index) => (
              <a 
                key={index} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block bg-surface p-4 rounded-lg shadow hover:bg-border transition-colors"
              >
                <h3 className="text-xl font-semibold text-primary">{item.title}</h3>
                <div className="text-sm text-gray-500">
                  {item.source} - {new Date(item.publishedAt).toLocaleString()}
                </div>
                <p className="mt-2 text-text">
                  {item.summary || "No summary provided."}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
