import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  Star,
  MessageSquareText,
  CheckCircle2,
  AlertCircle,
  Send,
  Smile,
  Meh,
  Frown,
  EyeOff,
  ClipboardList,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { submitFeedback as submitFeedbackRecord } from "../../api/feedbackApi";
import "./AiFeedback.css";

const FEEDBACK_CATEGORIES = [
  {
    value: "Facilities",
    label: "Facilities",
    description: "Toilets, parking, surau, resting area, cleanliness.",
  },
  {
    value: "Staff",
    label: "Staff",
    description: "Staff helpfulness, guidance, and response time.",
  },
  {
    value: "Crowding",
    label: "Crowding",
    description: "Crowd level, queue, entry flow, and comfort.",
  },
  {
    value: "General",
    label: "General",
    description: "Overall visitor experience.",
  },
  {
    value: "Other",
    label: "Other",
    description: "Anything else you want to share.",
  },
];

function getSentiment(text, rating) {
  const lowerText = text.toLowerCase();

  const negativeWords = [
    "bad",
    "dirty",
    "slow",
    "crowded",
    "angry",
    "rude",
    "poor",
    "problem",
    "issue",
    "hate",
    "unhappy",
    "disappointed",
  ];

  const positiveWords = [
    "good",
    "great",
    "nice",
    "clean",
    "helpful",
    "beautiful",
    "excellent",
    "happy",
    "love",
    "friendly",
    "enjoy",
  ];

  const negativeScore = negativeWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  const positiveScore = positiveWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  if (rating >= 4 && positiveScore >= negativeScore) {
    return {
      label: "Positive",
      icon: Smile,
      score: 0.91,
      message: "Thank you! We are glad you enjoyed your visit.",
    };
  }

  if (rating <= 2 || negativeScore > positiveScore) {
    return {
      label: "Negative",
      icon: Frown,
      score: 0.86,
      message:
        "Thank you for sharing this. Your feedback will help staff improve the service.",
    };
  }

  return {
    label: "Neutral",
    icon: Meh,
    score: 0.78,
    message:
      "Thank you. Your feedback has been recorded for future improvement.",
  };
}

function extractKeywords(text, category) {
  const keywords = [];

  if (category) keywords.push(category);

  const keywordMap = {
    Cleanliness: ["clean", "dirty", "rubbish", "toilet"],
    Crowding: ["crowd", "crowded", "queue", "busy", "people"],
    Staff: ["staff", "guard", "helpful", "rude", "service"],
    Parking: ["parking", "car", "vehicle"],
    Facilities: ["surau", "toilet", "cafeteria", "playground", "facility"],
    Safety: ["danger", "injury", "unsafe", "emergency"],
  };

  Object.entries(keywordMap).forEach(([label, words]) => {
    if (words.some((word) => text.toLowerCase().includes(word))) {
      keywords.push(label);
    }
  });

  return [...new Set(keywords)].slice(0, 4);
}

export function VisitorFeedbackModule({ onBack }) {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("General");
  const [feedbackText, setFeedbackText] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(null);

  const selectedCategory = FEEDBACK_CATEGORIES.find(
    (item) => item.value === category
  );

  const characterCount = feedbackText.length;

  const sentimentPreview = useMemo(() => {
    if (!rating && !feedbackText.trim()) return null;
    return getSentiment(feedbackText, rating || 3);
  }, [feedbackText, rating]);

  function resetForm() {
    setRating(0);
    setCategory("General");
    setFeedbackText("");
    setVisitorName("");
    setIsAnonymous(false);
    setError("");
    setIsSubmitting(false);
    setSubmittedFeedback(null);
  }

  async function submitFeedback() {
    if (!rating) {
      setError("Please select a star rating before submitting.");
      return;
    }

    if (!category) {
      setError("Please select a feedback category.");
      return;
    }

    if (feedbackText.length > 500) {
      setError("Feedback comment must be 500 characters or less.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const savedFeedback = await submitFeedbackRecord({
        rating,
        category,
        feedback_text: feedbackText.trim(),
        is_anonymous: isAnonymous,
        visitor_name: visitorName.trim(),
      });

      setSubmittedFeedback(savedFeedback);
    } catch (err) {
      setError(
        "Failed to submit feedback. Please make sure the backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedFeedback) {
    const SentimentIcon =
      submittedFeedback.sentiment_label === "Positive"
        ? Smile
        : submittedFeedback.sentiment_label === "Negative"
        ? Frown
        : Meh;

    return (
      <div className="visitorFeedbackPage">
        <div className="visitorFeedbackPhone">
          <div className="visitorFeedbackTopBar">
            <button className="visitorFeedbackIconButton" onClick={onBack}>
              <ChevronLeft size={19} />
            </button>

            <div>
              <strong>Feedback Submitted</strong>
              <span>Taman Botani Johor</span>
            </div>
          </div>

          <div className="visitorFeedbackSuccessScreen">
            <div className="visitorFeedbackSuccessIcon">
              <CheckCircle2 size={42} />
            </div>

            <h2>Thank you for your feedback!</h2>
            <p>
              Your feedback has been recorded and will help improve visitor
              experience at Taman Botani Johor.
            </p>

            <div className="visitorFeedbackReceipt">
              <div>
                <span>Feedback ID</span>
                <strong>{submittedFeedback.feedback_id}</strong>
              </div>

              <div>
                <span>Rating</span>
                <strong>{submittedFeedback.rating} / 5</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>{submittedFeedback.category}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{submittedFeedback.status}</strong>
              </div>
            </div>

            

            {(submittedFeedback.keywords_extracted || []).length > 0 && (
              <div className="visitorFeedbackKeywordBox">
                <span>Detected topics</span>

                <div>
                  {(submittedFeedback.keywords_extracted || []).map((keyword) => (
                    <strong key={keyword}>{keyword}</strong>
                  ))}
                </div>
              </div>
            )}

            <button
              className="visitorFeedbackPrimaryButton"
              onClick={resetForm}
            >
              <RotateCcw size={17} />
              Submit Another Feedback
            </button>

            <button className="visitorFeedbackGhostButton" onClick={onBack}>
              Back to Visitor App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="visitorFeedbackPage">
      <div className="visitorFeedbackPhone">
        <div className="visitorFeedbackTopBar">
          <button className="visitorFeedbackIconButton" onClick={onBack}>
            <ChevronLeft size={19} />
          </button>

          <div>
            <strong>Visitor Feedback</strong>
            <span>Share your visit experience</span>
          </div>
        </div>

        <div className="visitorFeedbackContent">
          <section className="visitorFeedbackHero">
            <div className="visitorFeedbackHeroIcon">
              <MessageSquareText size={26} />
            </div>

            <h2>How was your visit?</h2>
            <p>
              Rate your experience and tell us what can be improved. Your
              feedback helps staff understand visitor satisfaction.
            </p>
          </section>

          <section className="visitorFeedbackSection">
            <label className="visitorFeedbackSectionLabel">
              Overall Rating <span>*</span>
            </label>

            <div className="visitorFeedbackStars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className={value <= rating ? "isSelected" : ""}
                  onClick={() => {
                    setRating(value);
                    setError("");
                  }}
                  aria-label={`${value} star`}
                >
                  <Star size={30} />
                </button>
              ))}
            </div>

            <p className="visitorFeedbackRatingText">
              {rating === 0 && "Tap a star to rate your visit."}
              {rating === 1 && "Very poor experience"}
              {rating === 2 && "Poor experience"}
              {rating === 3 && "Average experience"}
              {rating === 4 && "Good experience"}
              {rating === 5 && "Excellent experience"}
            </p>
          </section>

          <section className="visitorFeedbackSection">
            <label className="visitorFeedbackSectionLabel">
              Feedback Category <span>*</span>
            </label>

            <div className="visitorFeedbackCategoryGrid">
              {FEEDBACK_CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  className={category === item.value ? "isSelected" : ""}
                  onClick={() => {
                    setCategory(item.value);
                    setError("");
                  }}
                >
                  <strong>{item.label}</strong>
                </button>
              ))}
            </div>

            {selectedCategory && (
              <p className="visitorFeedbackCategoryHint">
                {selectedCategory.description}
              </p>
            )}
          </section>

          <section className="visitorFeedbackSection">
            <label className="visitorFeedbackSectionLabel">
              Comment Optional
            </label>

            <textarea
              value={feedbackText}
              maxLength={500}
              onChange={(event) => {
                setFeedbackText(event.target.value);
                setError("");
              }}
              placeholder="Example: The park was clean and staff were helpful, but the queue was quite long..."
            />

            <div className="visitorFeedbackTextareaFooter">
              <span>{characterCount}/500 characters</span>

              {sentimentPreview && (
                <div
                  className={`visitorFeedbackSentimentPreview ${sentimentPreview.label.toLowerCase()}`}
                >
                  <Sparkles size={13} />
                  {sentimentPreview.label}
                </div>
              )}
            </div>
          </section>

          {!isAnonymous && (
            <section className="visitorFeedbackSection">
              <label className="visitorFeedbackSectionLabel">
                Visitor Name Optional
              </label>

              <input
                className="visitorFeedbackTextInput"
                value={visitorName}
                onChange={(event) => setVisitorName(event.target.value)}
                placeholder="Example: Nur Alya"
              />
            </section>
          )}

          <label className="visitorFeedbackAnonymousToggle">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(event) => {
                setIsAnonymous(event.target.checked);
                setError("");
              }}
            />

            <div>
              <strong>
                <EyeOff size={15} />
                Submit anonymously
              </strong>
              <span>Your name will not be shown to staff.</span>
            </div>
          </label>

          {error && (
            <div className="visitorFeedbackError">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            className="visitorFeedbackPrimaryButton"
            onClick={submitFeedback}
            disabled={isSubmitting}
          >
            <Send size={17} />
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>

          <div className="visitorFeedbackFlowNote">
            <ClipboardList size={16} />
            <span>
              After submission, AI will classify sentiment and update the staff
              feedback dashboard.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
