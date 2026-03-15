import React, { useState } from 'react';
import api from '../api/api';
import StarRating from './StarRating';

const ReviewForm = ({ productId, token, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (!message.trim()) {
            setError('Please write a review message.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post(
                '/api/review/add',
                {
                    productId,
                    rating,
                    message: message.trim(),
                },
                {
                    headers: { token },
                }
            );

            if (response.data.success) {
                setSuccess('Your review has been submitted. Thank you!');
                setRating(0);
                setMessage('');
                if (onReviewSubmitted) onReviewSubmitted();
            } else {
                setError(response.data.message || 'Failed to submit review.');
            }
        } catch (err) {
            const msg = err.response?.data?.message;
            if (err.response?.status === 409) {
                // Duplicate review — refresh the section so the existing review shows
                setSuccess('Review already submitted for this product.');
                if (onReviewSubmitted) onReviewSubmitted();
            } else {
                setError(msg || 'An error occurred. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Selector */}
            <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-800 mb-3">Your Rating</p>
                <StarRating value={rating} readOnly={false} onChange={setRating} size="lg" />
                {rating > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                    </p>
                )}
            </div>

            {/* Message */}
            <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-800 mb-2" htmlFor="reviewMessage">
                    Your Review
                </label>
                <textarea
                    id="reviewMessage"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your experience with this fragrance..."
                    rows={4}
                    maxLength={1000}
                    className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#FFD1DC] transition-colors duration-200 resize-none"
                />
                <p className="text-[10px] text-gray-400 text-right mt-1">{message.length}/1000</p>
            </div>

            {/* Error / Success feedback */}
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            {success && <p className="text-xs text-emerald-600 font-medium">{success}</p>}

            {/* Submit */}
            <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gray-900 text-white text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#FFD1DC] hover:text-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

export default ReviewForm;
