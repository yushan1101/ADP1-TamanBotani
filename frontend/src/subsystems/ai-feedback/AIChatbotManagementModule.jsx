import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit3,
  HelpCircle,
  MapPin,
  MessageCircle,
  PackageSearch,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldAlert,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { BackButton, PageHeader } from "./AiFeedbackShared";
import "./AiFeedback.css";

const INITIAL_CASES = [
  {
    case_id: "C-1001",
    session_id: "S-5001",
    user_type: "Visitor",
    visitor_name: "Nur Alya",
    category: "Emergency",
    status: "Pending",
    priority: "High",
    reference_no: "EM-483920",
    report_no: "",
    created_at: "2026-06-01T10:12:00",
    last_updated: "2026-06-01T10:12:00",
    intent_detected: "emergency_medical_help",
    confidence_score: 96.8,
    is_flagged: true,
    assigned_staff: "",
    visitor_message:
      "I need medical help near the lake trail. My friend feels dizzy.",
    bot_response:
      "Emergency assistance activated. Staff will be notified immediately.",
    staff_response: "",
    location: "Lake Trail",
    contact: "012-3456789",
    notes: "Medical assistance required.",
  },
  {
    case_id: "C-1002",
    session_id: "S-5002",
    user_type: "Visitor",
    visitor_name: "Daniel Tan",
    category: "Lost Item",
    status: "Assigned",
    priority: "Medium",
    reference_no: "",
    report_no: "LI-718204",
    created_at: "2026-06-01T11:05:00",
    last_updated: "2026-06-01T11:20:00",
    intent_detected: "report_lost_item",
    confidence_score: 94.3,
    is_flagged: false,
    assigned_staff: "Staff A",
    visitor_message:
      "I lost a black wallet near the picnic area. My phone number is 018-7788990.",
    bot_response:
      "Lost item report submitted. Staff will contact you if the item is found.",
    staff_response: "",
    location: "Picnic Area",
    contact: "018-7788990",
    notes: "Black wallet. Check picnic area and visitor counter.",
  },
  {
    case_id: "C-1003",
    session_id: "S-5003",
    user_type: "Visitor",
    visitor_name: "Priya Nair",
    category: "FAQ Escalation",
    status: "Pending",
    priority: "Low",
    reference_no: "",
    report_no: "",
    created_at: "2026-06-01T12:40:00",
    last_updated: "2026-06-01T12:40:00",
    intent_detected: "unknown_question",
    confidence_score: 42.5,
    is_flagged: true,
    assigned_staff: "",
    visitor_message:
      "Can I book a private plant photography workshop for my club?",
    bot_response:
      "I could not find a clear answer. Your question has been forwarded to staff.",
    staff_response: "",
    location: "-",
    contact: "-",
    notes: "Bot could not match FAQ. Manual reply required.",
  },
  {
    case_id: "C-1004",
    session_id: "S-5004",
    user_type: "Visitor",
    visitor_name: "Wong Zi Qi",
    category: "FAQ",
    status: "Resolved",
    priority: "Low",
    reference_no: "",
    report_no: "",
    created_at: "2026-05-31T15:25:00",
    last_updated: "2026-05-31T15:30:00",
    intent_detected: "ask_operating_hours",
    confidence_score: 97.2,
    is_flagged: false,
    assigned_staff: "Staff B",
    visitor_message: "What time does the park close?",
    bot_response:
      "Taman Botani Johor is open from 7:00 AM to 7:00 PM.",
    staff_response: "Visitor was informed through chatbot.",
    location: "-",
    contact: "-",
    notes: "FAQ answered successfully.",
  },
];

const INITIAL_FAQ_ITEMS = [
  {
    faq_id: "FAQ-001",
    question: "What are the operating hours?",
    answer: "Taman Botani Johor is open daily from 7:00 AM to 7:00 PM.",
    category: "Park Info",
    usage_count: 128,
    status: "Active",
    last_updated: "2026-06-01T09:00:00",
  },
  {
    faq_id: "FAQ-002",
    question: "Where are the toilets?",
    answer:
      "Toilets are located near the main entrance, visitor centre, and picnic area.",
    category: "Facilities",
    usage_count: 94,
    status: "Active",
    last_updated: "2026-06-01T09:10:00",
  },
  {
    faq_id: "FAQ-003",
    question: "Is parking available?",
    answer:
      "Free parking is available near the main entrance. Overflow parking may open during peak periods.",
    category: "Facilities",
    usage_count: 82,
    status: "Active",
    last_updated: "2026-06-01T09:20:00",
  },
  {
    faq_id: "FAQ-004",
    question: "Are pets allowed?",
    answer:
      "Pets are not allowed inside the park to protect the plants, wildlife, and natural environment.",
    category: "Park Rules",
    usage_count: 45,
    status: "Active",
    last_updated: "2026-06-01T09:30:00",
  },
];

function getCategoryClass(category) {
  if (category === "Emergency") return "chatStaffEmergency";
  if (category === "Lost Item") return "chatStaffLost";
  if (category === "FAQ Escalation") return "chatStaffEscalation";
  return "chatStaffFaq";
}

function getStatusBadge(status) {
  if (status === "Pending") return "danger";
  if (status === "Assigned") return "warn";
  return "good";
}

function getPriorityBadge(priority) {
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warn";
  return "good";
}

function getCaseIcon(category) {
  if (category === "Emergency") return <ShieldAlert size={18} />;
  if (category === "Lost Item") return <PackageSearch size={18} />;
  if (category === "FAQ Escalation") return <AlertTriangle size={18} />;
  return <HelpCircle size={18} />;
}

function getCaseReference(item) {
  if (item.category === "Emergency") {
    return item.reference_no || "No reference no.";
  }

  if (item.category === "Lost Item") {
    return item.report_no || "No report no.";
  }

  return "Not required";
}

function getReferenceLabel(item) {
  if (item.category === "Emergency") return "Reference No.";
  if (item.category === "Lost Item") return "Report No.";
  return "Reference";
}

function getReferenceDescription(item) {
  if (item.category === "Emergency") return "Emergency visitor reference";
  if (item.category === "Lost Item") return "Lost item report number";
  return "No reference required";
}

function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AIChatbotManagementModule({ onBack }) {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [selectedId, setSelectedId] = useState(INITIAL_CASES[0].case_id);
  const [tab, setTab] = useState("cases");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [replyDraft, setReplyDraft] = useState("");

  const [faqItems, setFaqItems] = useState(INITIAL_FAQ_ITEMS);
  const [selectedFaqId, setSelectedFaqId] = useState(
    INITIAL_FAQ_ITEMS[0].faq_id
  );
  const [faqEditMode, setFaqEditMode] = useState(false);
  const [faqAnswerDraft, setFaqAnswerDraft] = useState("");

  const selectedCase =
    cases.find((item) => item.case_id === selectedId) || cases[0];

  const selectedFaq =
    faqItems.find((item) => item.faq_id === selectedFaqId) || faqItems[0];

  const filteredCases = useMemo(() => {
    return cases
      .filter((item) => {
        const matchFilter = filter === "All" || item.category === filter;
        const keyword = search.toLowerCase();

        const matchSearch =
          item.case_id.toLowerCase().includes(keyword) ||
          item.visitor_name.toLowerCase().includes(keyword) ||
          item.visitor_message.toLowerCase().includes(keyword) ||
          item.category.toLowerCase().includes(keyword);

        return matchFilter && matchSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();

        return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
      });
  }, [cases, filter, search, sortOrder]);

  const metrics = useMemo(() => {
    return {
      total: cases.length,
      pending: cases.filter((item) => item.status === "Pending").length,
      emergency: cases.filter((item) => item.category === "Emergency").length,
      escalated: cases.filter((item) => item.category === "FAQ Escalation")
        .length,
    };
  }, [cases]);

  function updateCase(id, changes) {
    setCases((prev) =>
      prev.map((item) =>
        item.case_id === id
          ? {
              ...item,
              ...changes,
              last_updated: new Date().toISOString(),
            }
          : item
      )
    );
  }

  function assignToMe() {
    updateCase(selectedCase.case_id, {
      status: "Assigned",
      assigned_staff: "Current Staff",
    });
  }

  function sendReply() {
    const reply = replyDraft.trim();

    if (!reply) return;

    updateCase(selectedCase.case_id, {
      status: "Resolved",
      staff_response: reply,
      assigned_staff: selectedCase.assigned_staff || "Current Staff",
    });

    setReplyDraft("");
  }

  function markResolved() {
    updateCase(selectedCase.case_id, {
      status: "Resolved",
      staff_response:
        selectedCase.staff_response ||
        "Staff reviewed the case and marked it as resolved.",
      assigned_staff: selectedCase.assigned_staff || "Current Staff",
    });
  }

  function startEditFaq() {
    setFaqAnswerDraft(selectedFaq.answer);
    setFaqEditMode(true);
  }

  function cancelEditFaq() {
    setFaqAnswerDraft("");
    setFaqEditMode(false);
  }

  function saveFaqAnswer() {
    const newAnswer = faqAnswerDraft.trim();

    if (!newAnswer) return;

    setFaqItems((prev) =>
      prev.map((item) =>
        item.faq_id === selectedFaq.faq_id
          ? {
              ...item,
              answer: newAnswer,
              last_updated: new Date().toISOString(),
            }
          : item
      )
    );

    setFaqEditMode(false);
    setFaqAnswerDraft("");
  }

  return (
    <div className="aiChatbotStaffPage">
      <BackButton onBack={onBack} />

      <PageHeader
        icon={Bot}
        title="AI Chatbot Staff Dashboard"
        description="Review visitor chatbot cases, emergency alerts, lost item reports, FAQ escalations, and staff responses."
      />

      <div className="metricRow chatStaffMetricRow">
        {[
          {
            label: "Total Cases",
            value: metrics.total,
            icon: MessageCircle,
            tone: "chatStaffFaq",
          },
          {
            label: "Pending Review",
            value: metrics.pending,
            icon: Clock,
            tone: metrics.pending > 0 ? "chatStaffEmergency" : "chatStaffFaq",
          },
          {
            label: "Emergency Cases",
            value: metrics.emergency,
            icon: ShieldAlert,
            tone: "chatStaffEmergency",
          },
          {
            label: "FAQ Escalations",
            value: metrics.escalated,
            icon: HelpCircle,
            tone: "chatStaffEscalation",
          },
        ].map(({ label, value, icon: Icon, tone }) => (
          <section key={label} className={`metric chatStaffMetric ${tone}`}>
            <div className="metricIcon">
              <Icon size={22} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
          </section>
        ))}
      </div>

      <div className="chatStaffTabs">
        {[
          ["cases", "Case Inbox", Bell],
          ["faq", "FAQ Knowledge Base", HelpCircle],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            className={tab === key ? "primaryButton" : "ghostButton"}
            onClick={() => {
              setTab(key);
              setFaqEditMode(false);
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === "cases" && (
        <div className="chatStaffLayout">
          <section className="panel chatStaffInbox">
            <div className="chatStaffInboxHeader">
              <div>
                <h2>Chatbot Case Inbox</h2>
                <p>Cases created from visitor chatbot interactions.</p>
              </div>
            </div>

            <div className="chatStaffSearchBar">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search case, visitor, or message..."
              />
            </div>

            <div className="chatStaffSortRow">
              <div>
                <ArrowDownUp size={15} />
                <span>Sort by</span>
              </div>

              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              >
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            <div className="chatStaffFilterRow">
              {["All", "Emergency", "Lost Item", "FAQ Escalation", "FAQ"].map(
                (item) => (
                  <button
                    key={item}
                    className={filter === item ? "isActive" : ""}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <div className="chatStaffCaseList">
              {filteredCases.map((item) => (
                <button
                  key={item.case_id}
                  className={`chatStaffCaseItem ${getCategoryClass(
                    item.category
                  )} ${selectedId === item.case_id ? "isSelected" : ""}`}
                  onClick={() => {
                    setSelectedId(item.case_id);
                    setReplyDraft("");
                  }}
                >
                  <div className="chatStaffCaseIcon">
                    {getCaseIcon(item.category)}
                  </div>

                  <div className="chatStaffCaseText">
                    <div>
                      <strong>{item.category}</strong>
                      <span>{item.case_id}</span>
                    </div>

                    <p>{item.visitor_message}</p>

                    <small>
                      {item.visitor_name} · {formatDateTime(item.created_at)}
                    </small>
                  </div>

                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>

          <section
            className={`panel chatStaffDetail ${getCategoryClass(
              selectedCase.category
            )}`}
          >
            <div className="chatStaffDetailTop">
              <div>
                <span className="chatStaffDetailLabel">Selected Case</span>
                <h2>{selectedCase.category}</h2>
                <p>
                  {selectedCase.case_id} · Session {selectedCase.session_id}
                </p>
              </div>

              <div className="chatStaffBadgeGroup">
                <span
                  className={`aiBadge ${getPriorityBadge(
                    selectedCase.priority
                  )}`}
                >
                  <div className="aiBadgeDot" />
                  {selectedCase.priority} Priority
                </span>

                <span
                  className={`aiBadge ${getStatusBadge(selectedCase.status)}`}
                >
                  <div className="aiBadgeDot" />
                  {selectedCase.status}
                </span>
              </div>
            </div>

            <div className="chatStaffSummaryGrid">
              <div className="chatStaffSummaryCard">
                <div className="chatStaffSummaryIcon">
                  <Users size={18} />
                </div>

                <div>
                  <span>Visitor</span>
                  <strong>{selectedCase.visitor_name}</strong>
                  <p>{selectedCase.contact}</p>
                </div>
              </div>

              <div className="chatStaffSummaryCard">
                <div className="chatStaffSummaryIcon">
                  <ClipboardList size={18} />
                </div>

                <div>
                  <span>{getReferenceLabel(selectedCase)}</span>
                  <strong>{getCaseReference(selectedCase)}</strong>
                  <p>{getReferenceDescription(selectedCase)}</p>
                </div>
              </div>

              <div className="chatStaffSummaryCard">
                <div className="chatStaffSummaryIcon">
                  <MapPin size={18} />
                </div>

                <div>
                  <span>Location</span>
                  <strong>{selectedCase.location}</strong>
                  
                </div>
              </div>

              <div className="chatStaffSummaryCard">
                <div className="chatStaffSummaryIcon">
                  <UserCheck size={18} />
                </div>

                <div>
                  <span>Assigned Staff</span>
                  <strong>{selectedCase.assigned_staff || "Unassigned"}</strong>
                  <p>{selectedCase.status}</p>
                </div>
              </div>
            </div>

            {selectedCase.is_flagged && (
              <div className="chatStaffFlagBox compact">
                <AlertTriangle size={17} />
                <span>
                  This case is flagged because it is urgent or the chatbot
                  confidence is low.
                </span>
              </div>
            )}

            <details className="chatStaffAccordion" open>
              <summary>
                <span>Case Information</span>
                <ChevronDown size={16} />
              </summary>

              <div className="chatStaffAccordionBody">
                <div className="chatStaffInfoTable">
                  <div>
                    <span>Intent Detected</span>
                    <strong>{selectedCase.intent_detected}</strong>
                  </div>

                  <div>
                    <span>AI Confidence</span>
                    <strong>{selectedCase.confidence_score}%</strong>
                  </div>

                  <div>
                    <span>Created At</span>
                    <strong>{formatDateTime(selectedCase.created_at)}</strong>
                  </div>

                  <div>
                    <span>Last Updated</span>
                    <strong>{formatDateTime(selectedCase.last_updated)}</strong>
                  </div>

                  <div>
                    <span>Case ID</span>
                    <strong>{selectedCase.case_id}</strong>
                  </div>

                  <div>
                    <span>Session ID</span>
                    <strong>{selectedCase.session_id}</strong>
                  </div>
                </div>
              </div>
            </details>

            <details className="chatStaffAccordion" open>
              <summary>
                <span>Conversation</span>
                <ChevronDown size={16} />
              </summary>

              <div className="chatStaffAccordionBody">
                <div className="chatStaffConversationClean">
                  <div className="chatStaffMessageLine visitor">
                    <span>Visitor</span>
                    <p>{selectedCase.visitor_message}</p>
                  </div>

                  <div className="chatStaffMessageLine bot">
                    <span>AI Bot</span>
                    <p>{selectedCase.bot_response}</p>
                  </div>

                  {selectedCase.staff_response && (
                    <div className="chatStaffMessageLine staff">
                      <span>Staff</span>
                      <p>{selectedCase.staff_response}</p>
                    </div>
                  )}
                </div>
              </div>
            </details>

            <details className="chatStaffAccordion">
              <summary>
                <span>Staff Notes</span>
                <ChevronDown size={16} />
              </summary>

              <div className="chatStaffAccordionBody">
                <div className="chatStaffNotesClean">
                  <ClipboardList size={17} />
                  <p>{selectedCase.notes}</p>
                </div>
              </div>
            </details>

            {selectedCase.status !== "Resolved" && (
              <div className="chatStaffActionPanel clean">
                <div className="chatStaffButtonRow">
                  <button className="ghostButton" onClick={assignToMe}>
                    <UserCheck size={15} />
                    Assign to Me
                  </button>

                  <button className="ghostButton" onClick={markResolved}>
                    <CheckCircle2 size={15} />
                    Mark Resolved
                  </button>
                </div>

                <label>
                  Staff Reply
                  <textarea
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    placeholder="Type response to visitor..."
                  />
                </label>

                <button
                  className="primaryButton chatStaffSendButton"
                  onClick={sendReply}
                  disabled={!replyDraft.trim()}
                >
                  <Send size={16} />
                  Send Reply & Resolve
                </button>
              </div>
            )}

            {selectedCase.status === "Resolved" && (
              <div className="chatStaffResolvedBox">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Case resolved</strong>
                  <p>
                    Last updated at{" "}
                    {formatDateTime(selectedCase.last_updated)}.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "faq" && (
        <div className="chatStaffFaqLayout">
          <section className="panel chatStaffFaqListPanel">
            <div className="chatStaffDetailHeader">
              <div>
                <h2>FAQ Knowledge Base</h2>
                <p>Click an FAQ to view or edit its answer.</p>
              </div>
            </div>

            <div className="chatStaffFaqList">
              {faqItems.map((faq) => (
                <button
                  key={faq.faq_id}
                  className={`chatStaffFaqListItem ${
                    selectedFaqId === faq.faq_id ? "isSelected" : ""
                  }`}
                  onClick={() => {
                    setSelectedFaqId(faq.faq_id);
                    setFaqEditMode(false);
                    setFaqAnswerDraft("");
                  }}
                >
                  <div>
                    <strong>{faq.question}</strong>
                    <span>
                      {faq.faq_id} · {faq.category}
                    </span>
                  </div>

                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>

          <section className="panel chatStaffFaqDetailPanel">
            <div className="chatStaffDetailTop">
              <div>
                <span className="chatStaffDetailLabel">FAQ Details</span>
                <h2>{selectedFaq.question}</h2>
                <p>
                  {selectedFaq.faq_id} · {selectedFaq.category}
                </p>
              </div>

              <span className="aiBadge good">
                <div className="aiBadgeDot" />
                {selectedFaq.status}
              </span>
            </div>

            <div className="chatStaffSummaryGrid faq">
              <div className="chatStaffSummaryCard">
                <div className="chatStaffSummaryIcon">
                  <HelpCircle size={18} />
                </div>

                <div>
                  <span>Category</span>
                  <strong>{selectedFaq.category}</strong>
                  <p>FAQ grouping</p>
                </div>
              </div>

              <div className="chatStaffSummaryCard">
                <div className="chatStaffSummaryIcon">
                  <Users size={18} />
                </div>

                <div>
                  <span>Usage Count</span>
                  <strong>{selectedFaq.usage_count}</strong>
                  <p>Visitor chatbot usage</p>
                </div>
              </div>

              <div className="chatStaffSummaryCard">
                <div className="chatStaffSummaryIcon">
                  <Clock size={18} />
                </div>

                <div>
                  <span>Last Updated</span>
                  <strong>{formatDateTime(selectedFaq.last_updated)}</strong>
                  <p>Knowledge base record</p>
                </div>
              </div>
            </div>

            <div className="chatStaffDetailSection">
              <div className="chatStaffSectionHeader faqAnswerHeader">
                <h3>Answer</h3>

                {!faqEditMode && (
                  <button className="ghostButton" onClick={startEditFaq}>
                    <Edit3 size={15} />
                    Edit Answer
                  </button>
                )}
              </div>

              {!faqEditMode ? (
                <div className="chatStaffFaqAnswerBox">
                  <p>{selectedFaq.answer}</p>
                </div>
              ) : (
                <div className="chatStaffFaqEditBox">
                  <textarea
                    value={faqAnswerDraft}
                    onChange={(event) => setFaqAnswerDraft(event.target.value)}
                    placeholder="Edit FAQ answer..."
                  />

                  <div className="chatStaffButtonRow">
                    <button className="ghostButton" onClick={cancelEditFaq}>
                      <XCircle size={15} />
                      Cancel
                    </button>

                    <button
                      className="primaryButton"
                      onClick={saveFaqAnswer}
                      disabled={!faqAnswerDraft.trim()}
                    >
                      <Save size={15} />
                      Save Answer
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="chatStaffFaqNote">
              <RefreshCw size={17} />
              <p>
                Updated answers will be used by the visitor chatbot before
                escalating unmatched questions to staff.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
