import React from 'react';
import StarRating from './StarRating';

const ReviewList = ({ reviews, loading }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                        <div className="h-3 w-full bg-gray-100 rounded" />
                        <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <p className="text-sm text-gray-400 italic text-center py-6">
                No reviews yet. Be the first to share your experience!
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review, idx) => (
                <div
                    key={idx}
                    className="border-b border-gray-100 pb-6 last:border-0 last:pb-0 group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            {/* Avatar initial */}
                            <div className="w-8 h-8 rounded-full bg-[#FFD1DC] bg-opacity-30 flex items-center justify-center text-[11px] font-bold text-gray-700">
                                {(review.reviewerName || 'A')[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">{review.reviewerName || 'Anonymous'}</p>
                                <p className="text-[10px] text-gray-400">{review.createdAt || ''}</p>
                            </div>
                        </div>
                        <StarRating value={review.rating} readOnly size="sm" />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed pl-11">
                        "{review.message}"
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
