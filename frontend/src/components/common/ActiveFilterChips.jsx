import React from 'react';

const ActiveFilterChips = ({ filters, onRemove, onClearAll }) => {
    // Flatten filters to get all active values
    const activeFilters = Object.entries(filters).flatMap(([category, values]) =>
        values.map(value => ({ category, value }))
    );

    if (activeFilters.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-8 animate-fadeIn">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">
                Active Filters:
            </span>

            {activeFilters.map(({ category, value }) => (
                <div
                    key={`${category}-${value}`}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#FFD1DC]/10 border border-[#FFD1DC]/30 rounded-full group hover:border-[#FFD1DC] transition-all cursor-default"
                >
                    <span className="text-[10px] text-gray-500 font-medium">
                        <span className="capitalize opacity-60">{category}:</span> {value}
                    </span>
                    <button
                        onClick={() => onRemove(category, value)}
                        className="p-0.5 hover:bg-[#FFD1DC] rounded-full transition-colors group-hover:text-white text-gray-400"
                    >
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}

            <button
                onClick={onClearAll}
                className="text-[10px] font-bold text-gray-400 hover:text-red-400 transition-colors uppercase tracking-widest ml-2 border-b border-transparent hover:border-red-400"
            >
                Clear All
            </button>
        </div>
    );
};

export default ActiveFilterChips;
