import React, { useState } from 'react';

const FilterGroup = ({ title, options, selectedValues, onToggle, showSearch = false }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedOptions = showAll ? filteredOptions : filteredOptions.slice(0, 5);
    const hasMore = filteredOptions.length > 5;

    return (
        <div className="border-b border-gray-100 py-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between mb-4 group"
            >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] group-hover:text-gray-600 transition-colors">
                    {title}
                </span>
                {isExpanded ? (
                    <svg className="w-3 h-3 text-gray-300 group-hover:text-[#FFD1DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                ) : (
                    <svg className="w-3 h-3 text-gray-300 group-hover:text-[#FFD1DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                )}
            </button>

            {isExpanded && (
                <div className="space-y-3 animate-fadeIn">
                    {showSearch && options.length > 8 && (
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder={`Search ${title}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-gray-100 rounded-sm focus:outline-none focus:border-[#FFD1DC] text-gray-600"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-2.5">
                        {displayedOptions.map((option) => (
                            <label
                                key={option}
                                className="flex items-center gap-3 cursor-pointer group w-fit"
                            >
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        className="peer appearance-none w-4 h-4 border border-gray-200 rounded-sm checked:bg-[#FFD1DC] checked:border-transparent transition-all cursor-pointer"
                                        checked={selectedValues.includes(option)}
                                        onChange={() => onToggle(option)}
                                    />
                                    <svg
                                        className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className={`text-xs tracking-wider transition-colors ${selectedValues.includes(option)
                                    ? 'text-gray-900 font-bold'
                                    : 'text-gray-600 group-hover:text-[#FFD1DC]'
                                    }`}>
                                    {option}
                                </span>
                            </label>
                        ))}

                        {filteredOptions.length === 0 && (
                            <p className="text-[10px] italic text-gray-400">No matches found</p>
                        )}

                        {hasMore && !searchTerm && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="text-[10px] font-bold text-[#FFD1DC] mt-2 flex items-center gap-1 hover:text-[#ffb6c1] transition-colors uppercase tracking-widest"
                            >
                                {showAll ? 'Show Less' : `+ Show ${options.length - 5} More`}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterGroup;
