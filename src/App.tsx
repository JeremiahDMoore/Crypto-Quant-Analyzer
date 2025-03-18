// App.tsx
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Brain, LineChart, Newspaper, AlertCircle } from 'lucide-react';
import { getCryptoData, getNews, analyzeMarket, getHistoricalData } from './services/api';
import { CryptoChart } from './components/CryptoChart';
import { NewsPanel } from './components/NewsPanel';
import { SignalPanel } from './components/SignalPanel';
import type { CryptoData, HistoricalData } from './types';

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');

  const { data: cryptoData, isLoading: isLoadingCrypto, error: cryptoError } = useQuery(
    ['crypto', selectedSymbol],
    () => getCryptoData(selectedSymbol),
    {
      refetchInterval: 900000,
      retry: 3
    }
  );

  const { data: news, isLoading: isLoadingNews, error: newsError } = useQuery(
    'news',
    getNews,
    {
      refetchInterval: 900000,
      retry: 3
    }
  );

  const { data: historicalData, isLoading: isLoadingHistorical, error: historicalError } = useQuery<HistoricalData>(
    ['historical', selectedSymbol],
    () => getHistoricalData(selectedSymbol),
    {
      retry: 3,
    }
  );

  const { data: signal, isLoading: isLoadingSignal, error: signalError } = useQuery(
    ['signal', cryptoData, news],
    () => (cryptoData && news ? analyzeMarket(cryptoData, news) : null),
    {
      enabled: !!cryptoData && !!news,
      retry: 2
    }
  );

  if (isLoadingCrypto || isLoadingNews || isLoadingSignal || isLoadingHistorical) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cryptoError || newsError || signalError || historicalError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center text-error mb-4">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4 text-text">Error</h2>
          <p className="text-text text-center">
            {(cryptoError as Error)?.message ||
             (newsError as Error)?.message ||
             (signalError as Error)?.message ||
             (historicalError as Error)?.message ||
             'An unexpected error occurred. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-text flex items-center">
              <Brain className="mr-2" /> Crypto Quant Analyzer
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-text">{selectedSymbol}/USDT</span>
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => setSelectedSymbol('ETH')}
              className={`px-4 py-2 border rounded-md ${
                selectedSymbol === 'ETH' ? 'bg-primary text-white' : 'bg-surface text-text'
              }`}
            >
              ETH
            </button>
            <button
              onClick={() => setSelectedSymbol('SOL')}
              className={`px-4 py-2 border rounded-md ${
                selectedSymbol === 'SOL' ? 'bg-primary text-white' : 'bg-surface text-text'
              }`}
            >
              SOL
            </button>
            <button
              onClick={() => setSelectedSymbol('BTC')}
              className={`px-4 py-2 border rounded-md ${
                selectedSymbol === 'BTC' ? 'bg-primary text-white' : 'bg-surface text-text'
              }`}
            >
              BTC
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-surface rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center text-text">
                  <LineChart className="mr-2" /> Price Chart
                </h2>
              </div>
              {historicalData && <CryptoChart data={historicalData} />}
            </div>

            {signal && <SignalPanel signal={signal} />}
          </div>

          <div>
            <div className="flex items-center mb-4">
              <Newspaper className="mr-2" />
              <h2 className="text-2xl font-bold text-text">Market News</h2>
            </div>
            {news && <NewsPanel news={news} />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;