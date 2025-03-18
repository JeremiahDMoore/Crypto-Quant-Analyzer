// CryptoChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import type { HistoricalData } from '../types';

interface Props {
  data: HistoricalData;
}

// Helper function to calculate Simple Moving Average (SMA)
const calculateSMA = (data: { date: string; price: number }[], period: number): { date: string; sma: number }[] => {
    if (data.length < period) {
        return []; // Not enough data to calculate SMA
    }

    const smaData: { date: string; sma: number }[] = [];
    for (let i = period - 1; i < data.length; i++) {
        const window = data.slice(i - period + 1, i + 1);
        const sum = window.reduce((acc, val) => acc + val.price, 0);
        smaData.push({ date: data[i].date, sma: sum / period });
    }
    return smaData;
};

export function CryptoChart({ data }: Props) {

  // Calculate moving averages
    const sma7 = calculateSMA(data.prices, 7);
    // Merge price data with moving averages
    const chartData = data.prices.map(priceData => {
      const sma7Data = sma7.find(sma => sma.date === priceData.date);
      return {
          date: format(new Date(priceData.date), 'MM-dd'),
          price: priceData.price,
          sma7: sma7Data ? sma7Data.sma : null, // 7-day SMA
      };
  });

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Price"
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="sma7"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ r: 0 }}
            name="7-Day SMA"
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CryptoChart;