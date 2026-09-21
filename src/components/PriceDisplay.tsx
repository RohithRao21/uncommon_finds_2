import React from 'react';
import { formatINR, formatUSD } from '../utils/currency';

interface PriceDisplayProps {
  amount: number;
  showUSD?: boolean;
  className?: string;
  usdClassName?: string;
  layout?: 'inline' | 'stacked';
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  showUSD = true,
  className = '',
  usdClassName = '',
  layout = 'inline',
}) => {
  const inrText = formatINR(amount);
  const usdText = formatUSD(amount);

  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="font-extrabold">{inrText}</span>
        {showUSD && (
          <span className={`text-[0.65em] font-normal opacity-60 tracking-normal leading-tight ${usdClassName}`}>
            (~{usdText})
          </span>
        )}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-baseline gap-1.5 flex-wrap ${className}`}>
      <span className="font-extrabold">{inrText}</span>
      {showUSD && (
        <span className={`text-[0.65em] font-normal opacity-60 tracking-normal whitespace-nowrap ${usdClassName}`}>
          (~{usdText})
        </span>
      )}
    </span>
  );
};
