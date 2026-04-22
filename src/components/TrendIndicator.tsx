// src/components/TrendIndicator.tsx
import React from 'react';

interface Props {
  value: number;
  inverse?: boolean; // If true, negative is green and positive is red (e.g. deaths)
  isPercentage?: boolean;
}

export default function TrendIndicator({ value, inverse = false, isPercentage = false }: Props) {
  if (value === 0 || isNaN(value)) {
    return <span className="trend-neutral">-</span>;
  }

  const isPositive = value > 0;
  const isGood = inverse ? !isPositive : isPositive;
  const colorClass = isGood ? 'trend-up' : 'trend-down';
  const arrow = isPositive ? '▲' : '▼';
  
  const absValue = Math.abs(value);
  const formattedValue = isPercentage ? `${absValue}%` : absValue;

  return (
    <span className={colorClass}>
      {arrow} {formattedValue}
    </span>
  );
}
