const fs = require('fs');

const path = 'c:/Users/Admin/OneDrive/Desktop/villa-booking/app/farms/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 0. Add imports
content = content.replace(
  /ChevronDown\s*\n\}\s*from\s*'lucide-react';/,
  "ChevronDown,\n  Star,\n  StarHalf\n} from 'lucide-react';"
);

// 1. Add states
content = content.replace(
  /const\s*\[openPolicy\,\s*setOpenPolicy\]\s*=\s*useState<'rules'\s*\|\s*'cancellation'\s*\|\s*null>\(null\);/,
  "const [openPolicy, setOpenPolicy] = useState<'rules' | 'cancellation' | null>(null);\n  const [reviews, setReviews] = useState<any[]>([]);\n  const [reviewText, setReviewText] = useState('');\n  const [reviewRating, setReviewRating] = useState(5);\n  const [isSubmittingReview, setIsSubmittingReview] = useState(false);"
);

// 2. Add fetchReviews
content = content.replace(
  /fetchFarmBookings\(\);\s*\n\s*\}\,\s*\[farm\]\);/,
  "fetchFarmBookings();\n    \n    async function fetchReviews() {\n      try {\n        const farmId = farm?._id || (farm as any)?.id;\n        if (!farmId) return;\n        const res = await fetch(`/api/reviews?farmId=${farmId}`);\n        if (res.ok) {\n          const data = await res.json();\n          setReviews(data);\n        }\n      } catch (err) {\n        console.error('Error fetching reviews:', err);\n      }\n    }\n    fetchReviews();\n  }, [farm]);"
);

// 3. Add submitReview
content = content.replace(
  /return\s*dates;\s*\n\s*\}\,\s*\[existingBookings\]\);/,
  `return dates;\n  }, [existingBookings]);\n\n  const submitReview = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!session?.user) {\n      toast.error('Please sign in to leave a review.');\n      router.push('/login');\n      return;\n    }\n    if (!reviewText.trim()) {\n      toast.error('Please enter your review.');\n      return;\n    }\n    setIsSubmittingReview(true);\n    try {\n      const farmId = farm?._id || (farm as any)?.id;\n      const res = await fetch('/api/reviews', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({\n          farmId,\n          name: (session.user as any).name || 'Guest',\n          text: reviewText,\n          rating: reviewRating,\n          img: (session.user as any).image || undefined,\n        })\n      });\n      if (res.ok) {\n        const newReview = await res.json();\n        setReviews([newReview, ...reviews]);\n        setReviewText('');\n        setReviewRating(5);\n        toast.success('Review submitted successfully!');\n      } else {\n        toast.error('Failed to submit review.');\n      }\n    } catch (err) {\n      toast.error('Could not submit review.');\n    } finally {\n      setIsSubmittingReview(false);\n    }\n  };`
);

// 4. Add UI
content = content.replace(
  /<\/div>\s*\n\s*<\/div>\s*\n\s*\{\/\*\s*Booking\s*\/\s*Sticky\s*Card\s*Column\s*\*\/\}/,
  `</div>\n\n  {/* Guest Reviews Section */}\n  <div className="pb-10 mb-10 border-t border-gray-100 pt-10">\n    <div className="flex items-center gap-3 mb-8">\n      <div className="w-1.5 h-6 bg-[#002E1E] rounded-sm"></div>\n      <h3 className="font-sans text-xl font-bold text-[#002E1E]">Guest Reviews</h3>\n    </div>\n\n    <form onSubmit={submitReview} className="mb-10 p-6 bg-white border border-gray-100 rounded-xl shadow-sm">\n      <h4 className="font-bold text-[#1B2A22] mb-4">Leave a Review</h4>\n      <div className="flex items-center gap-2 mb-4">\n        <span className="text-[13px] font-bold text-gray-600">Rating:</span>\n        <div className="flex gap-1">\n          {[1, 2, 3, 4, 5].map((star) => (\n            <button\n              key={star}\n              type="button"\n              onClick={() => setReviewRating(star)}\n              className="focus:outline-none"\n            >\n              <Star className={\`h-6 w-6 transition-colors \${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}\`} />\n            </button>\n          ))}\n        </div>\n      </div>\n      <textarea\n        rows={3}\n        value={reviewText}\n        onChange={(e) => setReviewText(e.target.value)}\n        placeholder="Share your experience at this farmhouse..."\n        className="w-full rounded-xl border-gray-200 bg-[#f9fafb] px-4 py-3 text-sm text-[#1B2A22] placeholder:text-gray-400 outline-none transition-all border focus:border-[#00a877] focus:bg-white resize-none mb-4"\n      />\n      <button \n        type="submit"\n        disabled={isSubmittingReview}\n        className="bg-[#00a877] hover:bg-[#009669] px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-colors shadow-sm disabled:opacity-50"\n      >\n        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}\n      </button>\n    </form>\n\n    {reviews.length > 0 ? (\n      <div className="space-y-6">\n        {reviews.map((rev: any, idx: number) => (\n          <div key={idx} className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">\n            <div className="flex items-center justify-between mb-3">\n              <div className="flex items-center gap-3">\n                <img src={rev.img || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt={rev.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />\n                <div>\n                  <p className="font-bold text-[#1B2A22] text-sm">{rev.name}</p>\n                  <p className="text-[11px] text-gray-500 font-bold tracking-wide uppercase">{new Date(rev.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>\n                </div>\n              </div>\n              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">\n                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />\n                <span className="text-xs font-bold text-amber-900">{rev.rating || 5}</span>\n              </div>\n            </div>\n            <p className="text-[14px] text-gray-600 font-medium leading-relaxed mt-2">{rev.text}</p>\n          </div>\n        ))}\n      </div>\n    ) : (\n      <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 border-dashed">\n        <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />\n        <p className="text-[14px] font-bold text-gray-500">No reviews yet. Be the first to review!</p>\n      </div>\n    )}\n  </div>\n  </div>\n\n  {/* Booking / Sticky Card Column */}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('File updated successfully.');
