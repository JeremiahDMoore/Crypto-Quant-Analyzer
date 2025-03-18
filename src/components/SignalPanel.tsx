import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MarketSignal } from '../types';

interface Props {
  signal: MarketSignal;
}

export function SignalPanel({ signal }: Props) {
  const getSignalIcon = (signal: 'buy' | 'sell' | 'hold') => {
    switch (signal) {
      case 'buy':
        return <TrendingUp className="text-secondary" size={24} />;
      case 'sell':
        return <TrendingDown className="text-error" size={24} />;
      default:
        return <Minus className="text-text" size={24} />;
    }
  };

  const getSignalColor = (signal: 'buy' | 'sell' | 'hold') => {
    switch (signal) {
      case 'buy':
        return 'text-green-500';
      case 'sell':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Market Signals</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Short Term</h3>
          <div className="flex items-center space-x-2">
            {getSignalIcon(signal.shortTermSignal)}
            <span className={`text-xl font-bold ${getSignalColor(signal.shortTermSignal)}`}>
              {signal.shortTermSignal.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Long Term</h3>
          <div className="flex items-center space-x-2">
            {getSignalIcon(signal.longTermSignal)}
            <span className={`text-xl font-bold ${getSignalColor(signal.longTermSignal)}`}>
              {signal.longTermSignal.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">AI Confidence</h3>
        <div className="w-full bg-gray-300 rounded-full h-2.5 mt-2">
          <div 
            className="bg-purple-600 h-2.5 rounded-full" 
            style={{ width: `${signal.confidence}%` }}
          ></div>
        </div>
        <p className="text-right text-sm text-gray-400 mt-1">{signal.confidence}%</p>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Analysis</h3>
        <div className="text-gray-300 mt-2 whitespace-pre-line">{signal.reasoning}</div>
      </div>
    </div>
  );
}