import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import type { CryptoData } from '../types';

interface Props {
  data: CryptoData[];
}

export function CryptoChart({ data }: Props) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(time) => format(new Date(time), 'HH:mm')}
          />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}