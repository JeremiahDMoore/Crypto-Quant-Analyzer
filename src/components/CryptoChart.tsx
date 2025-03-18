// CryptoChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import type { HistoricalData } from '../types';

interface Props {
  data: HistoricalData;
}

// Helper function to calculate Simple Moving Average (SMA)
const calculateSMA = (data: { date: string; price: number }[], period: number): { date: string; sma: number }[] => {
    const smaData: { date: string; sma: number }[] = [];
    for (let i = 0; i < data.length; i++) {
        const window = data.slice(Math.max(0, i - period + 1), i + 1);
        const sum = window.reduce((acc, val) => acc + val.price, 0);
        smaData.push({ date: data[i].date, sma: sum / window.length });
    }
    return smaData;
};

export function CryptoChart({ data }: Props) {

  // Calculate moving averages
    const sma50 = calculateSMA(data.prices, 50);
    // Merge price data with moving averages
    const chartData = data.prices.map((priceData, index) => ({
      date: format(new Date(priceData.date), 'HH:mm'),
      price: priceData.price,
      sma50: sma50[index] ? sma50[index].sma : null, // 50-day MA
    }));

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E1E1E',
              border: '1px solid #333333',
              borderRadius: '4px',
            }}
            cursor={{ stroke: '#E0E0E0', strokeDasharray: '3 3' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            name="Price"
            connectNulls={true}
          />
          {chartData.length >= 9 && (
            <ReferenceLine x={chartData[8].date} stroke="#ddd" strokeDasharray="3 3" name="9th" />
          )}
          <Line
            type="monotone"
            dataKey="sma50"
            stroke="#FF5733"
            strokeWidth={2}
            dot={false}
            name="50-Day MA"
            connectNulls={true}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CryptoChart;