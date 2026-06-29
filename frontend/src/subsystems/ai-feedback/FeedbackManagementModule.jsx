import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Eye,
  Frown,
  Meh,
  MessageSquareText,
  Search,
  Send,
  Smile,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { BackButton, PageHeader } from "./AiFeedbackShared";
import {
  getFeedbackRecords,
  updateFeedbackStatus,
} from "../../api/feedbackApi";
import "./AiFeedback.css";

const INITIAL_FEEDBACK = [
  {
    feedback_id: "FB-1001",
    //visitor_id: "V-1028",
    visitor_name: "Nur Alya",
    visit_record_id: "VR-2026-0008",
    rating: 5,
    category: "Facilities",
    feedback_text:
      "The park was very clean and beautiful. The staff were helpful when we asked for directions.",
    is_anonymous: false,
    submitted_at: "2026-06-01T10:30:00",
    status: "New",
    sentiment_label: "Positive",
    sentiment_score: 0.94,
    keywords_extracted: ["Facilities", "Cleanliness", "Staff"],
    //model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: true,
  },
  {
    feedback_id: "FB-1002",
    //visitor_id: "V-1041",
    visitor_name: "Daniel Tan",
    visit_record_id: "VR-2026-0011",
    rating: 4,
    category: "General",
    feedback_text:
      "The park is good and friendly staff.",
    is_anonymous: false,
    submitted_at: "2026-06-01T11:45:00",
    status: "New",
    sentiment_label: "Positive",
    sentiment_score: 0.87,
    keywords_extracted: ["Staff"],
    //model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: true,
  },
  {
    feedback_id: "FB-1003",
    //visitor_id: null,
    visitor_name: "Anonymous Visitor",
    visit_record_id: "VR-2026-0015",
    rating: 3,
    category: "General",
    feedback_text:
      "Overall okay, but some signs near the lake trail were not clear.",
    is_anonymous: true,
    submitted_at: "2026-06-01T13:15:00",
    status: "Reviewed",
    sentiment_label: "Neutral",
    sentiment_score: 0.76,
    keywords_extracted: ["General", "Signage"],
    //model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: false,
  },
  {
    feedback_id: "FB-1004",
    //visitor_id: "V-1077",
    visitor_name: "Priya Nair",
    visit_record_id: "VR-2026-0018",
    rating: 1,
    category: "Staff",
    feedback_text:
      "I asked for help but the response was slow. Please improve staff availability during busy hours.",
    is_anonymous: false,
    submitted_at: "2026-05-31T16:20:00",
    status: "Responded",
    sentiment_label: "Negative",
    sentiment_score: 0.91,
    keywords_extracted: ["Staff", "Service", "Busy Hours"],
    //model_used: "Gemini Sentiment Model",
    staff_response:
      "Thank you for your feedback. We will improve staff allocation during busy hours.",
    responded_by: "Staff A",
    responded_at: "2026-05-31T17:00:00",
    is_visible_to_visitor: true,
  },
  {
    feedback_id: "FB-1005",
    visitor_id: "V-1088",
    visitor_name: "Lim Wei",
    visit_record_id: "VR-2026-0019",
    rating: 4,
    category: "Facilities",
    feedback_text: "The garden was clean and the toilets were easy to find.",
    is_anonymous: false,
    submitted_at: "2026-05-30T09:15:00",
    status: "Reviewed",
    sentiment_label: "Positive",
    sentiment_score: 0.9,
    keywords_extracted: ["Facilities", "Cleanliness", "Toilet"],
    model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: true,
    },
    {
    feedback_id: "FB-1006",
    visitor_id: null,
    visitor_name: "Anonymous Visitor",
    visit_record_id: "VR-2026-0020",
    rating: 3,
    category: "General",
    feedback_text: "The visit was okay, but the map direction could be clearer.",
    is_anonymous: true,
    submitted_at: "2026-05-30T14:40:00",
    status: "New",
    sentiment_label: "Neutral",
    sentiment_score: 0.77,
    keywords_extracted: ["General", "Map", "Signage"],
    model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: false,
    },
    {
    feedback_id: "FB-1007",
    visitor_id: "V-1091",
    visitor_name: "Aiman Hakim",
    visit_record_id: "VR-2026-0021",
    rating: 5,
    category: "Staff",
    feedback_text: "Staff were friendly and helped us find the lake trail.",
    is_anonymous: false,
    submitted_at: "2026-05-29T10:25:00",
    status: "Responded",
    sentiment_label: "Positive",
    sentiment_score: 0.93,
    keywords_extracted: ["Staff", "Friendly", "Lake Trail"],
    model_used: "Gemini Sentiment Model",
    staff_response: "Thank you for your kind feedback.",
    responded_by: "Staff B",
    responded_at: "2026-05-29T11:00:00",
    is_visible_to_visitor: true,
    },
    {
    feedback_id: "FB-1008",
    visitor_id: "V-1095",
    visitor_name: "Siti Aminah",
    visit_record_id: "VR-2026-0022",
    rating: 2,
    category: "Crowding",
    feedback_text: "The entrance area was crowded and the queue moved slowly.",
    is_anonymous: false,
    submitted_at: "2026-05-29T16:05:00",
    status: "New",
    sentiment_label: "Negative",
    sentiment_score: 0.88,
    keywords_extracted: ["Crowding", "Queue", "Entrance"],
    model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: true,
    },
    {
    feedback_id: "FB-1009",
    visitor_id: "V-1102",
    visitor_name: "Kavitha Rao",
    visit_record_id: "VR-2026-0023",
    rating: 4,
    category: "General",
    feedback_text: "Nice place for family walking. The environment felt calm.",
    is_anonymous: false,
    submitted_at: "2026-05-28T12:20:00",
    status: "Reviewed",
    sentiment_label: "Positive",
    sentiment_score: 0.89,
    keywords_extracted: ["General", "Family", "Environment"],
    model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: true,
    },
    {
    feedback_id: "FB-1010",
    visitor_id: null,
    visitor_name: "Anonymous Visitor",
    visit_record_id: "VR-2026-0024",
    rating: 3,
    category: "Facilities",
    feedback_text: "Facilities were acceptable but some benches need maintenance.",
    is_anonymous: true,
    submitted_at: "2026-05-27T13:10:00",
    status: "New",
    sentiment_label: "Neutral",
    sentiment_score: 0.73,
    keywords_extracted: ["Facilities", "Bench", "Maintenance"],
    model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: false,
    },
    {
    feedback_id: "FB-1011",
    visitor_id: "V-1110",
    visitor_name: "Chen Ming",
    visit_record_id: "VR-2026-0025",
    rating: 1,
    category: "Staff",
    feedback_text: "I could not find staff when I needed help near the trail.",
    is_anonymous: false,
    submitted_at: "2026-05-27T17:45:00",
    status: "New",
    sentiment_label: "Negative",
    sentiment_score: 0.9,
    keywords_extracted: ["Staff", "Trail", "Help"],
    model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: true,
    },
    {
    feedback_id: "FB-1012",
    visitor_id: "V-1115",
    visitor_name: "Farah Nadia",
    visit_record_id: "VR-2026-0026",
    rating: 5,
    category: "Facilities",
    feedback_text: "Beautiful flowers and clean walking paths.",
    is_anonymous: false,
    submitted_at: "2026-05-26T09:35:00",
    status: "Responded",
    sentiment_label: "Positive",
    sentiment_score: 0.95,
    keywords_extracted: ["Facilities", "Flowers", "Cleanliness"],
    model_used: "Gemini Sentiment Model",
    staff_response: "Thank you for visiting Taman Botani Johor.",
    responded_by: "Staff A",
    responded_at: "2026-05-26T10:05:00",
    is_visible_to_visitor: true,
    },
    {
    feedback_id: "FB-1013",
    visitor_id: "V-1119",
    visitor_name: "Ravi Kumar",
    visit_record_id: "VR-2026-0027",
    rating: 4,
    category: "General",
    feedback_text: "Good experience overall. More signs would be helpful.",
    is_anonymous: false,
    submitted_at: "2026-05-26T15:15:00",
    status: "Reviewed",
    sentiment_label: "Positive",
    sentiment_score: 0.84,
    keywords_extracted: ["General", "Signage"],
    model_used: "Gemini Sentiment Model",
    staff_response: "",
    responded_by: "",
    responded_at: null,
    is_visible_to_visitor: true,
    },
];

const CATEGORY_OPTIONS = [
  "All",
  "Facilities",
  "Staff",
  "Crowding",
  "General",
  "Other",
];

const SENTIMENT_OPTIONS = ["All", "Positive", "Neutral", "Negative"];

function normalizeFeedbackRecord(item) {
  const keywords = Array.isArray(item.keywords_extracted)
    ? item.keywords_extracted
    : [];

  return {
    ...item,
    visitor_id: item.visitor_id || "",
    visit_record_id: item.visit_record_id || "",
    model_used: item.model_used || "Mock Sentiment Rules",
    staff_response: item.staff_response || "",
    responded_by: item.responded_by || "",
    responded_at: item.responded_at || null,
    is_visible_to_visitor: item.is_visible_to_visitor ?? true,
    keywords_extracted: keywords,
    visitor_name: item.visitor_name || "Anonymous Visitor",
  };
}

function getSentimentClass(label) {
  if (label === "Positive") return "feedbackPositive";
  if (label === "Negative") return "feedbackNegative";
  return "feedbackNeutral";
}

function getSentimentBadge(label) {
  if (label === "Positive") return "good";
  if (label === "Negative") return "danger";
  return "warn";
}

function getStatusBadge(status) {
  if (status === "New") return "danger";
  if (status === "Reviewed") return "warn";
  return "good";
}

function getSentimentIcon(label) {
  if (label === "Positive") return <Smile size={18} />;
  if (label === "Negative") return <Frown size={18} />;
  return <Meh size={18} />;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderStars(rating) {
  return (
    <div className="feedbackStarRow">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={15}
          className={value <= rating ? "isFilled" : ""}
        />
      ))}
    </div>
  );
}

export function FeedbackManagementModule({ onBack }) {
  const [feedbackList, setFeedbackList] = useState(INITIAL_FEEDBACK);
  const [selectedId, setSelectedId] = useState(INITIAL_FEEDBACK[0].feedback_id);
  const [tab, setTab] = useState("feedback");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [sourceMessage, setSourceMessage] = useState(
    "Showing prototype feedback until database records are available."
  );

  useEffect(() => {
    let isMounted = true;

    async function loadFeedback() {
      try {
        const records = await getFeedbackRecords();

        if (!isMounted) return;

        if (records.length > 0) {
          const normalizedRecords = records.map(normalizeFeedbackRecord);
          setFeedbackList(normalizedRecords);
          setSelectedId(normalizedRecords[0].feedback_id);
          setSourceMessage("Showing feedback records loaded from MySQL.");
        } else {
          setSourceMessage(
            "No database feedback yet. Showing prototype feedback as fallback."
          );
        }
      } catch (err) {
        if (!isMounted) return;
        setSourceMessage(
          "Backend unavailable. Showing prototype feedback as fallback."
        );
      }
    }

    loadFeedback();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedFeedback =
    feedbackList.find((item) => item.feedback_id === selectedId) ||
    feedbackList[0];

  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        (item.visitor_name || "").toLowerCase().includes(keyword) ||
        (item.feedback_text || "").toLowerCase().includes(keyword) ||
        (item.category || "").toLowerCase().includes(keyword);

      const matchCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const matchSentiment =
        sentimentFilter === "All" ||
        item.sentiment_label === sentimentFilter;

      return matchSearch && matchCategory && matchSentiment;
    });
  }, [feedbackList, search, categoryFilter, sentimentFilter]);

  const metrics = useMemo(() => {
    const total = feedbackList.length;
    const averageRating =
      feedbackList.reduce((sum, item) => sum + item.rating, 0) / total;

    return {
      total,
      averageRating: averageRating.toFixed(1),
      positive: feedbackList.filter(
        (item) => item.sentiment_label === "Positive"
      ).length,
      negative: feedbackList.filter(
        (item) => item.sentiment_label === "Negative"
      ).length,
    };
  }, [feedbackList]);

  const categorySummary = useMemo(() => {
    return CATEGORY_OPTIONS.filter((item) => item !== "All").map((category) => {
      const records = feedbackList.filter((item) => item.category === category);
      const average =
        records.length > 0
          ? (
              records.reduce((sum, item) => sum + item.rating, 0) /
              records.length
            ).toFixed(1)
          : "0.0";

      return {
        category,
        count: records.length,
        average,
      };
    });
  }, [feedbackList]);

  const dailyFeedbackSummary = useMemo(() => {
    const latestDate = new Date(
        Math.max(...feedbackList.map((item) => new Date(item.submitted_at)))
    );

    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(latestDate);
        date.setDate(latestDate.getDate() - (6 - index));

        const dateKey = date.toISOString().split("T")[0];

        return {
        date: dateKey,
        label: date.toLocaleDateString([], {
            month: "short",
            day: "2-digit",
        }),
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        };
    });

    feedbackList.forEach((item) => {
        const dateKey = item.submitted_at.split("T")[0];
        const day = days.find((entry) => entry.date === dateKey);

        if (!day) return;

        day.total += 1;

        if (item.sentiment_label === "Positive") day.positive += 1;
        if (item.sentiment_label === "Neutral") day.neutral += 1;
        if (item.sentiment_label === "Negative") day.negative += 1;
    });

    return days;
    }, [feedbackList]);

    const maxDailyFeedback = Math.max(
    ...dailyFeedbackSummary.map((item) => item.total),
    1
    );

  function updateFeedback(id, changes) {
    setFeedbackList((prev) =>
      prev.map((item) =>
        item.feedback_id === id
          ? {
              ...item,
              ...changes,
            }
          : item
      )
    );
  }

  async function markReviewed() {
    updateFeedback(selectedFeedback.feedback_id, {
      status: "Reviewed",
    });

    try {
      const updatedFeedback = await updateFeedbackStatus(
        selectedFeedback.feedback_id,
        { status: "Reviewed" }
      );
      updateFeedback(
        selectedFeedback.feedback_id,
        normalizeFeedbackRecord(updatedFeedback)
      );
    } catch (err) {
      setSourceMessage(
        "Could not update database status. Local prototype status was updated only."
      );
    }
  }

  async function sendResponse() {
    const response = replyDraft.trim();

    if (!response) return;

    updateFeedback(selectedFeedback.feedback_id, {
      status: "Responded",
      staff_response: response,
      responded_by: "Current Staff",
      responded_at: new Date().toISOString(),
      is_visible_to_visitor: true,
    });

    setReplyDraft("");

    try {
      const updatedFeedback = await updateFeedbackStatus(
        selectedFeedback.feedback_id,
        {
          status: "Responded",
          staff_response: response,
          responded_by: "Current Staff",
        }
      );
      updateFeedback(
        selectedFeedback.feedback_id,
        normalizeFeedbackRecord(updatedFeedback)
      );
    } catch (err) {
      setSourceMessage(
        "Could not save staff response to database. Local prototype response was updated only."
      );
    }
  }

  return (
    <div className="feedbackStaffPage">
      <BackButton onBack={onBack} />

      <PageHeader
        icon={Star}
        title="Feedback & Communication "
        //description="Review visitor feedback, AI sentiment results, extracted keywords, and staff responses."
      />

      <div className="metricRow feedbackMetricRow">
        {[
          {
            label: "Total Feedback",
            value: metrics.total,
            icon: MessageSquareText,
            tone: "feedbackNeutral",
          },
          {
            label: "Average Rating",
            value: `${metrics.averageRating}★`,
            icon: Star,
            tone: "feedbackPositive",
          },
          {
            label: "Positive",
            value: metrics.positive,
            icon: Smile,
            tone: "feedbackPositive",
          },
          {
            label: "Negative",
            value: metrics.negative,
            icon: Frown,
            tone:
              metrics.negative > 0 ? "feedbackNegative" : "feedbackNeutral",
          },
        ].map(({ label, value, icon: Icon, tone }) => (
          <section key={label} className={`metric feedbackMetric ${tone}`}>
            <div className="metricIcon">
              <Icon size={22} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
          </section>
        ))}
      </div>

      <div className="feedbackTabs">
        {[
          ["feedback", "Feedback Inbox", ClipboardList],
          ["analytics", "AI Analysis", BarChart3],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            className={tab === key ? "primaryButton" : "ghostButton"}
            onClick={() => setTab(key)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === "feedback" && (
        <div className="feedbackStaffLayout">
          <section className="panel feedbackInbox">
            <div className="feedbackInboxHeader">
              <div>
                <h2>Feedback Inbox</h2>
                <p>{sourceMessage}</p>
              </div>
            </div>

            <div className="feedbackSearchBar">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search visitor, comment, or category..."
              />
            </div>

            <div className="feedbackSelectGrid">
              <label>
                Category
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  {CATEGORY_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Sentiment
                <select
                  value={sentimentFilter}
                  onChange={(event) => setSentimentFilter(event.target.value)}
                >
                  {SENTIMENT_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="feedbackList">
              {filteredFeedback.map((item) => (
                <button
                  key={item.feedback_id}
                  className={`feedbackListItem ${getSentimentClass(
                    item.sentiment_label
                  )} ${selectedId === item.feedback_id ? "isSelected" : ""}`}
                  onClick={() => {
                    setSelectedId(item.feedback_id);
                    setReplyDraft("");
                  }}
                >
                  <div className="feedbackListIcon">
                    {getSentimentIcon(item.sentiment_label)}
                  </div>

                  <div className="feedbackListText">
                    <div>
                      <strong>{item.category}</strong>
                      <span>{item.sentiment_label}</span>
                    </div>

                    {renderStars(item.rating)}

                    <p>{item.feedback_text}</p>

                    <small>
                      {item.visitor_name} · {formatDateTime(item.submitted_at)}
                    </small>
                  </div>

                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>

          <section
            className={`panel feedbackDetail ${getSentimentClass(
              selectedFeedback.sentiment_label
            )}`}
          >
            <div className="feedbackDetailTop">
              <div>
                <span className="feedbackDetailLabel">
                  Feedback ID: {selectedFeedback.feedback_id}
                </span>
                <h2>{selectedFeedback.category}</h2>
                <p>{formatDateTime(selectedFeedback.submitted_at)}</p>
              </div>

              <div className="feedbackBadgeGroup">
                <span
                  className={`aiBadge ${getSentimentBadge(
                    selectedFeedback.sentiment_label
                  )}`}
                >
                  <div className="aiBadgeDot" />
                  {selectedFeedback.sentiment_label}
                </span>

                <span
                  className={`aiBadge ${getStatusBadge(
                    selectedFeedback.status
                  )}`}
                >
                  <div className="aiBadgeDot" />
                  {selectedFeedback.status}
                </span>
              </div>
            </div>

            <div className="feedbackSummaryGrid compact">
              <div className="feedbackSummaryCard">
                <div className="feedbackSummaryIcon">
                  <Users size={18} />
                </div>

                <div>
                  <span>Visitor</span>
                  <strong>{selectedFeedback.visitor_name}</strong>
                  <p>
                    {selectedFeedback.is_anonymous
                      ? "Anonymous submission"
                      : selectedFeedback.visitor_id}
                  </p>
                </div>
              </div>

              <div className="feedbackSummaryCard">
                <div className="feedbackSummaryIcon">
                  <Star size={18} />
                </div>

                <div>
                  <span>Rating</span>
                  <strong>{selectedFeedback.rating} / 5</strong>
                  <p>Overall satisfaction</p>
                </div>
              </div>
            </div>

            <details className="feedbackAccordion" open>
              <summary>
                <span>Visitor Comment</span>
                <ChevronDown size={16} />
              </summary>

              <div className="feedbackAccordionBody">
                <div className="feedbackCommentBox">
                  <MessageSquareText size={17} />
                  <p>{selectedFeedback.feedback_text}</p>
                </div>
              </div>
            </details>

            <details className="feedbackAccordion">
              <summary>
                <span>AI Sentiment Analysis</span>
                <ChevronDown size={16} />
              </summary>

              <div className="feedbackAccordionBody">
                <div className="feedbackAnalysisBox">
                  <div className="feedbackSentimentMain">
                    <div className="feedbackSentimentIcon">
                      {getSentimentIcon(selectedFeedback.sentiment_label)}
                    </div>

                    <div>
                      <span>Detected Sentiment</span>
                      <strong>{selectedFeedback.sentiment_label}</strong>
                      <p>{selectedFeedback.model_used}</p>
                    </div>
                  </div>

                  <div className="feedbackKeywordList">
                    {selectedFeedback.keywords_extracted.map((keyword) => (
                      <span key={keyword}>{keyword}</span>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            <div className="feedbackDetailSection">
              <div className="feedbackSectionHeader">
                <h3>Staff Response</h3>
              </div>

              {selectedFeedback.staff_response ? (
                <div className="feedbackResponseBox">
                  <CheckCircle2 size={17} />
                  <div>
                    <strong>{selectedFeedback.responded_by}</strong>
                    <p>{selectedFeedback.staff_response}</p>
                    <span>
                      Responded at{" "}
                      {formatDateTime(selectedFeedback.responded_at)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="feedbackResponseEditor">
                  <textarea
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    placeholder="Type a response to the visitor..."
                  />

                  <div className="feedbackActionRow">
                    <button className="ghostButton" onClick={markReviewed}>
                      <Eye size={15} />
                      Mark Reviewed
                    </button>

                    <button
                      className="primaryButton"
                      onClick={sendResponse}
                      disabled={!replyDraft.trim()}
                    >
                      <Send size={15} />
                      Send Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === "analytics" && (
  <div className="feedbackAnalyticsGrid">
    <section className="panel feedbackTrendPanel">
      <div className="feedbackPanelHeader">
        <div>
          <h2>Feedback Trend Summary</h2>
          <p>AI-classified sentiment and satisfaction overview.</p>
        </div>
      </div>

      <div className="feedbackTrendCards">
        <div className="feedbackTrendCard feedbackPositive">
          <Smile size={22} />
          <span>Positive</span>
          <strong>{metrics.positive}</strong>
        </div>

        <div className="feedbackTrendCard feedbackNeutral">
          <Meh size={22} />
          <span>Neutral</span>
          <strong>
            {
              feedbackList.filter(
                (item) => item.sentiment_label === "Neutral"
              ).length
            }
          </strong>
        </div>

        <div className="feedbackTrendCard feedbackNegative">
          <Frown size={22} />
          <span>Negative</span>
          <strong>{metrics.negative}</strong>
        </div>
      </div>

      <div className="feedbackDailyChartBlock">
        <div className="feedbackPanelHeader small">
          <div>
            <h3>Daily Feedback Submissions</h3>
            <p>Last 7 days feedback volume with sentiment breakdown.</p>
          </div>
        </div>

        <div className="feedbackDailyChart">
          {dailyFeedbackSummary.map((item) => (
            <div key={item.date} className="feedbackDailyBarGroup">
              <div className="feedbackDailyTooltip">
                <strong>{item.label}</strong>
                <span>Total: {item.total}</span>
                <span>Positive: {item.positive}</span>
                <span>Neutral: {item.neutral}</span>
                <span>Negative: {item.negative}</span>
              </div>

              <div className="feedbackDailyBarTrack">
                <div
                  className="feedbackDailyBar"
                  style={{
                    height: `${Math.max(
                      (item.total / maxDailyFeedback) * 100,
                      item.total > 0 ? 12 : 4
                    )}%`,
                  }}
                >
                  <span>{item.total}</span>
                </div>
              </div>

              <strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="panel feedbackCategoryPanel">
      <div className="feedbackPanelHeader">
        <div>
          <h2>Category Performance</h2>
          <p>Average rating by feedback category.</p>
        </div>
      </div>

      <div className="feedbackCategoryList">
        {categorySummary.map((item) => (
          <div key={item.category} className="feedbackCategoryRow">
            <div>
              <strong>{item.category}</strong>
              <span>{item.count} feedback</span>
            </div>

            <div className="feedbackRatingPill">
              <Star size={14} />
              {item.average}
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="panel feedbackInsightPanel">
      <div className="feedbackPanelHeader">
        <div>
          <h2>AI Improvement Insights</h2>
          <p>Generated from negative feedback and common keywords.</p>
        </div>
      </div>

      <div className="feedbackInsightList">
        <div className="feedbackInsightItem danger">
          <AlertTriangle size={18} />
          <div>
            <strong>Queue and crowding issue detected</strong>
            <span>
              Negative feedback mentions long entrance queue and crowded picnic
              areas.
            </span>
          </div>
        </div>

        <div className="feedbackInsightItem warn">
          <TrendingUp size={18} />
          <div>
            <strong>Staff allocation should be reviewed</strong>
            <span>
              Several comments mention staff response time and visitor guidance
              during busy hours.
            </span>
          </div>
        </div>

        <div className="feedbackInsightItem good">
          <CheckCircle2 size={18} />
          <div>
            <strong>Facilities receive positive comments</strong>
            <span>
              Cleanliness and park environment are strong satisfaction factors.
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
)}
    </div>
  );
}
