import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { ShopContext } from '../context/ShopContext';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

const ReviewSection = ({ productId, onReviewAdded }) => {
    const { token } = useContext(ShopContext);
    const navigate = useNavigate();

    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const fetchReviews = useCallback(async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const headers = token ? { token } : {};
            const response = await api.get(`/api/review/product/${productId}`, { headers });
            if (response.data.success) {
                setReviewData(response.data.data);
            }
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setLoading(false);
        }
    }, [productId, token]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleReviewSubmitted = () => {
        setShowForm(false);
        fetchReviews();
        // Also refresh the product header (rating stars + count) in the parent page
        if (onReviewAdded) onReviewAdded();
    };

    const avgRating = reviewData?.averageRating || 0;
    const totalReviews = reviewData?.totalReviews || 0;
    const reviews = reviewData?.reviews || [];
    const userReview = reviewData?.userReview || null; // current user's review (if any)
    const isLoggedIn = !!token;
    const hasReviewed = isLoggedIn && userReview !== null;

    const handleWriteReviewClick = () => {
        if (!isLoggedIn) {
            // Redirect to login; after login the user comes back to this product page
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }
        setShowForm((prev) => !prev);
    };

    return (
        <section className="my-32 border-t border-gray-100 pt-24">
            {/* Section Header */}
            <div className="text-center mb-16">
                <h2 className="prata-regular text-3xl uppercase tracking-[0.2em] text-gray-800 mb-4">
                    Customer Reviews
                </h2>
                <div className="h-8 w-[1px] bg-gray-200 mx-auto" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Rating Summary Card */}
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-16 p-8 bg-[#FFF9FB] border border-[#FFD1DC] border-opacity-30">
                    {/* Average Score */}
                    <div className="text-center flex-shrink-0">
                        <p className="text-6xl font-light text-gray-800 leading-none mb-2">
                            {loading ? '—' : avgRating > 0 ? avgRating.toFixed(1) : '—'}
                        </p>
                        <StarRating value={avgRating} readOnly size="md" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-2">
                            {loading ? '' : `${totalReviews} ${totalReviews === 1 ? 'Review' : 'Reviews'}`}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block w-[1px] h-20 bg-gray-200 flex-shrink-0" />

                    {/* CTA Panel */}
                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            Share your experience with this fragrance and help others discover their perfect scent.
                        </p>

                        {hasReviewed ? (
                            /* User already reviewed — show badge instead of button */
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFF0F5] border border-[#FFD1DC] text-[10px] tracking-[0.2em] uppercase font-bold text-gray-700">
                                <svg className="w-3.5 h-3.5 text-[#FFD1DC] fill-current" viewBox="0 0 20 20">
                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                </svg>
                                You've reviewed this product
                            </div>
                        ) : !isLoggedIn ? (
                            /* Not logged in */
                            <button
                                type="button"
                                onClick={handleWriteReviewClick}
                                className="inline-flex items-center gap-2 px-8 py-3 border border-gray-900 text-[10px] tracking-[0.3em] uppercase font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Login to write a review
                            </button>
                        ) : (
                            /* Logged in, not yet reviewed */
                            <button
                                type="button"
                                onClick={handleWriteReviewClick}
                                className="inline-block px-8 py-3 border border-gray-900 text-[10px] tracking-[0.3em] uppercase font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
                            >
                                {showForm ? 'Cancel' : 'Write a Review'}
                            </button>
                        )}
                    </div>
                </div>

                {/* User's existing review (if already reviewed) */}
                {hasReviewed && (
                    <div className="mb-12 p-6 border border-[#FFD1DC] border-opacity-40 bg-[#FFF9FB]">
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 mb-4">
                            Your Review
                        </p>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#FFD1DC] bg-opacity-40 flex items-center justify-center text-[11px] font-bold text-gray-700">
                                {(userReview.reviewerName || 'Y')[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">{userReview.reviewerName}</p>
                                <p className="text-[10px] text-gray-400">{userReview.createdAt}</p>
                            </div>
                            <div className="ml-auto">
                                <StarRating value={userReview.rating} readOnly size="sm" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed pl-11">
                            "{userReview.message}"
                        </p>
                    </div>
                )}

                {/* Review Form (only visible when logged in, not yet reviewed, and toggled on) */}
                {showForm && isLoggedIn && !hasReviewed && (
                    <div className="mb-16 p-8 border border-gray-100 bg-white shadow-sm">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                            Your Review
                        </h3>
                        <ReviewForm
                            productId={productId}
                            token={token}
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    </div>
                )}

                {/* Reviews List */}
                <div>
                    {totalReviews > 0 && (
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-800 mb-8 pb-4 border-b border-gray-100">
                            Latest Reviews
                        </h3>
                    )}
                    <ReviewList reviews={reviews} loading={loading} />
                </div>
            </div>
        </section>
    );
};

export default ReviewSection;
