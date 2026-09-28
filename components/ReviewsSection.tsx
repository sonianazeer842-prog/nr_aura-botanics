/**
 * NR AURA BOTANICS
 * Customer Reviews / Testimonials Slider
*/

import React, { useState } from 'react';
import { CUSTOMER_REVIEWS } from '../constants';
import { CustomerReview } from '../types';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(CUSTOMER_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for new review
  const [newAuthor, setNewAuthor] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const prevReview = () => {
    setCurrentIndex(prev => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex(prev => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newComment) return;

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      name: newAuthor,
      city: newCity || "Pakistan",
      rating: newRating,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      verifiedBuyer: true,
      title: newTitle || "Excellent Botanical Serum",
      comment: newComment,
      resultTime: "Verified Customer",
      purchasedProduct: "Botanical Hair Growth Serum"
    };

    setReviews([newRev, ...reviews]);
    setCurrentIndex(0);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsModalOpen(false);
      setNewAuthor('');
      setNewCity('');
      setNewTitle('');
      setNewComment('');
    }, 1500);
  };

  const current = reviews[currentIndex] || reviews[0];

  return (
    <section id="reviews" className="py-16 md:py-24 bg-transparent border-b border-[#D4E7D2]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Overall Rating Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span className="text-xs uppercase tracking-widest text-botanic-leaf font-bold block mb-2">
              Real Experiences & Transformations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-botanic-wood text-balance">
              What Our Customers Say
            </h2>
            <p className="mt-2 text-sm sm:text-base text-botanic-woodMuted">
              Loved by thousands across Karachi, Lahore, Islamabad, and nationwide.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-[#D4E7D2] shadow-2xs">
            <div className="flex text-[#E5A83B]">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-botanic-wood tabular-nums">4.9 / 5.0</span>
              <span className="block text-[11px] text-botanic-woodMuted">Based on 450+ verified reviews</span>
            </div>
          </div>
        </div>

        {/* Testimonials Slider Card with translucent frosted background */}
        <div className="relative bg-[#F7FAF6]/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-[#D4E7D2] shadow-sm max-w-4xl mx-auto">
          {/* Decorative quote mark */}
          <div className="absolute top-6 right-8 text-botanic-leafSoft font-serif text-7xl select-none pointer-events-none">
            “
          </div>

          <div className="space-y-6">
            {/* Stars & Result Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-[#E5A83B]">
                {[...Array(current.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <span className="text-xs font-semibold text-botanic-leaf bg-botanic-leafSoft px-3 py-1 rounded-full">
                {current.resultTime}
              </span>
            </div>

            {/* Review Title & Body */}
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-botanic-wood mb-3">
                "{current.title}"
              </h3>
              <p className="text-sm sm:text-base text-botanic-wood/85 leading-relaxed italic">
                {current.comment}
              </p>
            </div>

            {/* Author lockup */}
            <div className="pt-4 border-t border-[#EFEAE2] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-botanic-sand flex items-center justify-center font-serif font-bold text-botanic-wood">
                  {current.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-botanic-wood">{current.name}</span>
                    {current.verifiedBuyer && (
                      <span className="text-[11px] text-botanic-leaf font-medium flex items-center gap-0.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-botanic-woodMuted">
                    {current.city} · {current.date}
                  </span>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevReview}
                  className="w-10 h-10 rounded-full border border-[#D9D1C3] bg-white hover:bg-[#F5F2EB] flex items-center justify-center text-botanic-wood transition-colors focus:outline-none"
                  aria-label="Previous review"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="text-xs font-semibold text-botanic-woodMuted tabular-nums px-2">
                  {currentIndex + 1} / {reviews.length}
                </span>

                <button
                  onClick={nextReview}
                  className="w-10 h-10 rounded-full border border-[#D9D1C3] bg-white hover:bg-[#F5F2EB] flex items-center justify-center text-botanic-wood transition-colors focus:outline-none"
                  aria-label="Next review"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Write a review trigger */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold text-botanic-wood hover:text-botanic-leaf underline underline-offset-4 transition-colors"
          >
            Have you used NR AURA BOTANICS? Share your review
          </button>
        </div>

        {/* Modal for adding a review */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#E5DDD2] shadow-xl relative animate-fade-in-up">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-botanic-woodMuted hover:text-botanic-wood"
                aria-label="Close modal"
              >
                ✕
              </button>

              <h3 className="font-serif text-2xl font-semibold text-botanic-wood mb-2">
                Write a Review
              </h3>
              <p className="text-xs text-botanic-woodMuted mb-6">
                Tell others about your experience with our Botanical Hair Growth Serum.
              </p>

              {formSubmitted ? (
                <div className="text-center py-8 text-botanic-leaf font-medium">
                  ✓ Thank you! Your review has been added.
                </div>
              ) : (
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-botanic-wood mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      placeholder="e.g. Fatima Ali"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#D9D1C3] rounded-lg focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-botanic-wood mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={e => setNewCity(e.target.value)}
                        placeholder="e.g. Lahore"
                        className="w-full px-3.5 py-2.5 text-sm border border-[#D9D1C3] rounded-lg focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-botanic-wood mb-1">
                        Rating (1-5) *
                      </label>
                      <select
                        value={newRating}
                        onChange={e => setNewRating(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm border border-[#D9D1C3] rounded-lg focus:outline-none focus:ring-1 focus:ring-botanic-leaf bg-white"
                      >
                        <option value={5}>5 Stars - Outstanding</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Good</option>
                        <option value={2}>2 Stars - Average</option>
                        <option value={1}>1 Star - Poor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-botanic-wood mb-1">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="e.g. Visible difference in 3 weeks"
                      className="w-full px-3.5 py-2.5 text-sm border border-[#D9D1C3] rounded-lg focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-botanic-wood mb-1">
                      Your Feedback *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Describe how your hair and scalp responded..."
                      className="w-full px-3.5 py-2.5 text-sm border border-[#D9D1C3] rounded-lg focus:outline-none focus:ring-1 focus:ring-botanic-leaf"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-botanic-wood hover:bg-botanic-sand rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-botanic-leaf text-white text-xs font-semibold rounded-lg hover:bg-botanic-leafDark transition-colors shadow-sm"
                    >
                      Publish Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default ReviewsSection;
