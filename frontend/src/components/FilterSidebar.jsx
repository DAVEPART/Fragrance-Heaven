import React, { useState } from 'react';
import { assets } from '../assets/assets';

const FilterSidebar = ({ showFilter, setShowFilter, filters, filterOptions, toggleFilter }) => {
    const [expandedSections, setExpandedSections] = useState({});

    if (!filterOptions) {
        return (
            <div className='min-w-64 animate-pulse'>
                <div className='h-8 bg-gray-100 w-32 mb-8'></div>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className='mb-8'>
                        <div className='h-3 bg-gray-50 w-20 mb-4'></div>
                        <div className='space-y-3'>
                            {[1, 2, 3].map(j => <div key={j} className='h-4 bg-gray-50 w-full'></div>)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const sections = [
        { title: 'Categories', key: 'category', options: filterOptions.categories },
        { title: 'Brands', key: 'brand', options: filterOptions.brands },
        { title: 'Concentration', key: 'concentration', options: filterOptions.concentration },
        { title: 'Character', key: 'character', options: filterOptions.character },
        { title: 'Season', key: 'season', options: filterOptions.season },
        { title: 'Occasion', key: 'occasion', options: filterOptions.occasion },
        { title: 'Type', key: 'subCategory', options: filterOptions.subCategory }
    ].filter(s => s.options && s.options.length > 0);

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className='min-w-64'>
            <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl font-bold flex items-center cursor-pointer gap-3 uppercase tracking-[0.2em] text-gray-800 prata-regular'>
                Refine
                <img className={`h-3 sm:hidden transition-transform ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
            </p>

            <div className={`${showFilter ? '' : 'hidden sm:block'} space-y-8 mt-8`}>
                {sections.map((section) => {
                    const isExpanded = expandedSections[section.key];
                    const visibleOptions = isExpanded ? section.options : section.options.slice(0, 5);
                    const hasMore = section.options.length > 5;

                    return (
                        <div key={section.key} className='border-b border-gray-100 pb-8'>
                            <p className='mb-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]'>{section.title}</p>
                            <div className='flex flex-col gap-3 text-xs font-semibold text-gray-600'>
                                {visibleOptions.map((option) => (
                                    <label key={option} className='flex gap-3 items-center cursor-pointer group'>
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                className='peer appearance-none w-4 h-4 border border-gray-200 rounded-sm checked:bg-[#FFD1DC] checked:border-transparent transition-all'
                                                type="checkbox"
                                                value={option}
                                                checked={filters[section.key]?.includes(option)}
                                                onChange={() => toggleFilter(section.key, option)}
                                            />
                                            <svg className="absolute w-2 h-2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className='group-hover:text-[#FFD1DC] transition-colors tracking-wider'>{option}</span>
                                    </label>
                                ))}

                                {hasMore && (
                                    <button
                                        onClick={() => toggleSection(section.key)}
                                        className='text-[#FFD1DC] text-[10px] font-bold uppercase tracking-widest mt-2 hover:text-[#ffb6c1] transition-colors text-left'
                                    >
                                        {isExpanded ? '- Show Less' : `+ Show ${section.options.length - 5} More`}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterSidebar;
