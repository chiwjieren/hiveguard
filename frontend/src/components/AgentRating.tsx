'use client';

import { useState } from 'react';

interface AgentRatingProps {
  agentId: number;
  agentName: string;
  score: number;
  onRateChange?: (rating: number) => void;
  readOnly?: boolean;
}

export function AgentRating({
  agentId,
  agentName,
  score,
  onRateChange,
  readOnly = false,
}: AgentRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (value: number) => {
    if (readOnly) return;
    setRating(value);
    onRateChange?.(value);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{agentName}</h3>
          <p className="text-sm text-slate-400 mt-1">Score: {score}/100</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">Rate accuracy:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`text-2xl transition-colors ${
                star <= displayRating
                  ? 'text-amber-400'
                  : 'text-slate-600'
              } ${!readOnly && 'cursor-pointer hover:text-amber-300'}`}
              disabled={readOnly}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      {rating > 0 && (
        <p className="text-xs text-slate-400 mt-3">
          Rating: {rating === 1 && 'Poor'} {rating === 2 && 'Fair'} {rating === 3 && 'Good'} {rating === 4 && 'Very Good'} {rating === 5 && 'Excellent'}
        </p>
      )}
    </div>
  );
}
