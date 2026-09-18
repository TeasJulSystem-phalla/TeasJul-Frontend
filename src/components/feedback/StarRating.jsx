// src/components/feedback/StarRating.jsx
import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({ value = 0, onChange, readOnly = false, size = "h-5 w-5" }) => {
  const [hovered, setHovered] = useState(0);

  if (readOnly) {
    return (
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`Rating: ${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            aria-hidden="true"
            className={`${size} transition-colors ${
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  }

  const shown = hovered || value;

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label={`ជ្រើសរើសចំណាត់ថ្នាក់ ${value} ក្នុងចំណោម 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ផ្កាយ`}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onFocus={() => setHovered(n)}
          onBlur={() => setHovered(0)}
          className="rounded p-0.5 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <Star
            aria-hidden="true"
            className={`${size} transition-colors ${
              n <= shown
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200 hover:fill-amber-200 dark:fill-slate-700 dark:text-slate-700"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;