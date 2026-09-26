// src/page/RateTeasJulPage.jsx
import { useState } from 'react';
import { Send, Star } from 'lucide-react';
import { Button, Card, EmptyState, Skeleton, Textarea } from '../components/ui/index.js';
import useToast from '../components/ui/Toast.jsx';
import StarRating from '../components/feedback/StarRating.jsx';
import FeedbackStatusBadge from '../components/feedback/FeedbackStatusBadge.jsx';
import { useOwnerFeedback } from '../hooks/useOwnerFeedback.js';
import { formatDate } from '../utils/format';

const RateTeasJulPage = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { feedback, loading: feedbackLoading, submitFeedback } = useOwnerFeedback();
  const toast = useToast();

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setRatingError('');
    setCommentError('');
    if (!rating) {
      setRatingError('សូមជ្រើសរើសចំណាត់ថ្នាក់ (Please select a rating)');
      return;
    }
    if (!comment.trim()) {
      setCommentError('សូមបញ្ចូលមតិយោបល់ (Please enter a comment)');
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedback({ rating, comment: comment.trim() });
      toast.success('បានដាក់ស្នើ', 'Feedback submitted. TeaJul will review and publish it.');
      setComment('');
      setRating(0);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'ការដាក់ស្នើមតិបរាជ័យ។';
      toast.error('កំហុស', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card
        title="វាយតម្លៃ TeasJul (Rate TeasJul)"
        description="ចែករំលែកបទពិសោធន៍របស់អ្នកជាមួយប្រព័ន្ធ TeasJul ជាអ្នកជួល ឬម្ចាស់អចលនទ្រព្យ"
      >
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Submit form */}
          <form onSubmit={handleFeedbackSubmit} className="space-y-4 lg:col-span-2">
            <div>
              <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                ចំណាត់ថ្នាក់ (Rating)
              </span>
              <StarRating value={rating} onChange={setRating} size="h-7 w-7" />
              {ratingError && (
                <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {ratingError}
                </p>
              )}
            </div>

            <Textarea
              label="មតិយោបល់ (Comment)"
              rows={4}
              maxLength={1000}
              placeholder="ចែករំលែកពីបទពិសោធន៍របស់អ្នកជាមួយ TeasJul..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              error={commentError}
            />

            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs ${
                  comment.length >= 950 ? 'text-red-500' : 'text-slate-400'
                }`}
                aria-live="polite"
              >
                {comment.length}/1000
              </span>
              <Button type="submit" loading={submitting} leftIcon={<Send className="h-4 w-4" />}>
                ដាក់ស្នើ
              </Button>
            </div>
          </form>

          {/* Submissions list */}
          <div className="lg:col-span-3">
            <h3 className="mb-3 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              ការដាក់ស្នើរបស់អ្នក (Your Submissions)
            </h3>

            {feedbackLoading ? (
              <Skeleton className="h-44 rounded-xl" />
            ) : feedback.length === 0 ? (
              <EmptyState
                icon={Star}
                title="មិនទាន់មានមតិទេ"
                description="មតិរបស់អ្នកនឹងបង្ហាញនៅទីនេះបន្ទាប់ពីដាក់ស្នើ និងត្រូវបានផ្សាយដោយក្រុមការងារ។"
              />
            ) : (
              <div className="space-y-3">
                {feedback.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StarRating value={f.rating} readOnly size="h-4 w-4" />
                      <FeedbackStatusBadge status={f.status} />
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
                      {f.comment}
                    </p>
                    <p className="mt-2 text-[12px] text-slate-400">{formatDate(f.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RateTeasJulPage;