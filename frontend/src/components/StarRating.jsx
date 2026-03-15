import React from 'react';

/**
 * StarRating component
 * @param {number} value      - Current rating value (0-5, supports decimals for display)
 * @param {boolean} readOnly  - If true, display only. If false, interactive (click to rate)
 * @param {function} onChange - Called with new rating value when user clicks (interactive mode)
 * @param {string} size       - 'sm' | 'md' | 'lg'
 */
const StarRating = ({ value = 0, readOnly = true, onChange, size = 'md' }) => {
    const [hovered, setHovered] = React.useState(0);

    const sizeMap = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-7 h-7',
    };
    const starSize = sizeMap[size] || sizeMap.md;

    const handleClick = (star) => {
        if (!readOnly && onChange) onChange(star);
    };

    const getStarFill = (star) => {
        const activeValue = readOnly ? value : (hovered || value);
        if (star <= Math.floor(activeValue)) return 'full';
        if (star === Math.ceil(activeValue) && activeValue % 1 >= 0.5) return 'half';
        return 'empty';
    };

    return (
        <div
            className="flex items-center gap-0.5"
            role={readOnly ? 'img' : 'radiogroup'}
            aria-label={`Rating: ${value} out of 5`}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = getStarFill(star);
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readOnly}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => !readOnly && setHovered(star)}
                        onMouseLeave={() => !readOnly && setHovered(0)}
                        aria-label={`${star} star`}
                        className={`relative ${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-transform duration-150 ${!readOnly && 'hover:scale-125'} focus:outline-none disabled:pointer-events-none`}
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        <svg className={`${starSize} transition-colors duration-150`} viewBox="0 0 20 20">
                            <defs>
                                <linearGradient id={`half-${star}`}>
                                    <stop offset="50%" stopColor="#FFD1DC" />
                                    <stop offset="50%" stopColor="#E5E7EB" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                fill={
                                    fill === 'full'
                                        ? '#FFD1DC'
                                        : fill === 'half'
                                            ? `url(#half-${star})`
                                            : '#E5E7EB'
                                }
                            />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
