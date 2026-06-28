import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  HelpCircle,
  AlertTriangle,
  ClipboardList,
  ChevronLeft,
  ChevronDown,
  X,
  Clock,
  MapPin,
  Car,
  Camera,
  PawPrint,
  Ticket,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";
import "./AiFeedback.css";

const FAQ_DATA = [
  {
    topic: "Operating Hours",
    icon: Clock,
    keywords: ["hour", "open", "close", "time", "operating"],
    answer:
      "Taman Botani Johor is open daily from 7:00 AM to 7:00 PM, including public holidays.",
  },
  {
    topic: "Ticket Prices",
    icon: Ticket,
    keywords: ["ticket", "price", "fee", "payment", "entrance"],
    answer:
      "Adults: RM5. Children below 12: RM2. Seniors 60 and above: RM2. MyKad holders receive a 50% discount.",
  },
  {
    topic: "Facilities",
    icon: MapPin,
    keywords: ["facility", "facilities", "toilet", "restroom", "surau", "cafeteria"],
    answer:
      "Available facilities include restrooms, picnic areas, herbarium, lake trail, children's playground, surau, and cafeteria near the main gate.",
  },
  {
    topic: "Parking",
    icon: Car,
    keywords: ["parking", "car", "vehicle", "park"],
    answer:
      "Free parking is available at the main entrance. During crowded periods, overflow parking may be opened near the south gate.",
  },
  {
    topic: "Photography",
    icon: Camera,
    keywords: ["photo", "photography", "camera", "shoot"],
    answer:
      "Personal photography is allowed. Commercial photography or filming requires permission from park management.",
  },
  {
    topic: "Pets",
    icon: PawPrint,
    keywords: ["pet", "dog", "cat", "animal"],
    answer:
      "Pets are not allowed inside the park to protect the plants, wildlife, and natural environment.",
  },
];

const CATEGORY_CONFIG = [
  {
    key: "FAQ",
    label: "FAQ",
    icon: HelpCircle,
    tone: "faq",
    desc: "Ask about opening hours, facilities, tickets, parking, and more.",
  },
  {
    key: "Emergency",
    label: "Emergency",
    icon: AlertTriangle,
    tone: "emergency",
    desc: "Request urgent assistance from on-duty staff.",
  },
  {
    key: "Lost Item",
    label: "Lost Item",
    icon: ClipboardList,
    tone: "lost",
    desc: "Report a lost item and leave your contact details.",
  },
];

function createMessage(sender, text, extra = {}) {
  return {
    id: Date.now() + Math.random(),
    sender,
    text,
    time: new Date().toISOString(),
    ...extra,
  };
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function findFaqAnswer(query) {
  const lowerQuery = query.toLowerCase();

  return FAQ_DATA.find((faq) =>
    faq.keywords.some((keyword) => lowerQuery.includes(keyword))
  );
}

export function VisitorChatbotModule({ onBack }) {
  const [category, setCategory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  const [lostStep, setLostStep] = useState(0);
  const [lostData, setLostData] = useState({
    description: "",
    location: "",
    contact: "",
  });

  const [emergencyStep, setEmergencyStep] = useState(0);
  const [emergencyData, setEmergencyData] = useState({
    location: "",
    nature: "",
  });

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, faqOpen]);

  function addUserMessage(text) {
    setMessages((prev) => [...prev, createMessage("visitor", text)]);
  }

  function addBotMessage(text, extra = {}) {
    setTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, createMessage("bot", text, extra)]);
      setTyping(false);
    }, 500);
  }

  function resetFlow() {
    setInput("");
    setFaqOpen(false);
    setLostStep(0);
    setEmergencyStep(0);
    setLostData({
      description: "",
      location: "",
      contact: "",
    });
    setEmergencyData({
      location: "",
      nature: "",
    });
  }

  function startCategory(cat) {
    setCategory(cat);
    setMessages([]);
    resetFlow();

    if (cat === "FAQ") {
      addBotMessage(
        "Hi! I can answer common questions about Taman Botani Johor. Choose a topic below or type your question.",
        {
          quickActions: [
            "Operating Hours",
            "Ticket Prices",
            "Facilities",
            "Parking",
            "Photography",
            "Pets",
          ],
        }
      );
    }

    if (cat === "Emergency") {
      addBotMessage(
        "Emergency assistance activated. Please tell me your current location in the park.",
        {
          urgent: true,
        }
      );
    }

    if (cat === "Lost Item") {
      addBotMessage(
        "I’ll help you report a lost item. Please describe the item first, including colour, brand, and type."
      );
    }
  }

  function goBackToMenu() {
    setCategory(null);
    setMessages([]);
    resetFlow();
  }

  function handleFaqTopic(topic) {
    const faq = FAQ_DATA.find((item) => item.topic === topic);

    if (!faq) return;

    addUserMessage(topic);
    setFaqOpen(false);

    addBotMessage(faq.answer, {
      quickActions: ["Ask another FAQ", "Emergency Help", "Report Lost Item"],
    });
  }

  function handleFaqFreeText() {
    const query = input.trim();

    if (!query) return;

    addUserMessage(query);
    setInput("");

    const faq = findFaqAnswer(query);

    if (faq) {
      addBotMessage(faq.answer, {
        quickActions: ["Ask another FAQ", "Emergency Help", "Report Lost Item"],
      });
      return;
    }

    addBotMessage(
      "Sorry, I could not find a clear answer for that. I have forwarded your question to staff for further assistance.",
      {
        escalated: true,
      }
    );
  }

  function handleEmergencyStep() {
    const value = input.trim();

    if (!value) return;

    addUserMessage(value);
    setInput("");

    if (emergencyStep === 0) {
      setEmergencyData((prev) => ({ ...prev, location: value }));
      setEmergencyStep(1);

      addBotMessage(
        "Understood. What is the nature of the emergency? For example: injury, fire, missing person, medical issue, or security concern.",
        {
          urgent: true,
        }
      );
      return;
    }

    if (emergencyStep === 1) {
      const referenceNo = `EM-${Math.floor(100000 + Math.random() * 900000)}`;

      setEmergencyData((prev) => ({ ...prev, nature: value }));
      setEmergencyStep(2);

      addBotMessage(
        `Emergency alert sent to on-duty staff.\n\nReference No: ${referenceNo}\nLocation: ${emergencyData.location}\nEmergency: ${value}\n\nPlease stay calm and remain at your location if it is safe.`,
        {
          success: true,
          urgent: true,
        }
      );
    }
  }

  function handleLostItemStep() {
    const value = input.trim();

    if (!value) return;

    addUserMessage(value);
    setInput("");

    if (lostStep === 0) {
      setLostData((prev) => ({ ...prev, description: value }));
      setLostStep(1);

      addBotMessage(
        "Got it. Where did you last see or use the item? Please describe the location in the park."
      );
      return;
    }

    if (lostStep === 1) {
      setLostData((prev) => ({ ...prev, location: value }));
      setLostStep(2);

      addBotMessage(
        "Please provide your contact number so staff can notify you if the item is found."
      );
      return;
    }

    if (lostStep === 2) {
      const reportNo = `LI-${Math.floor(100000 + Math.random() * 900000)}`;

      setLostData((prev) => ({ ...prev, contact: value }));
      setLostStep(3);

      addBotMessage(
        `Lost item report submitted.\n\nReport No: ${reportNo}\nItem: ${lostData.description}\nLast seen: ${lostData.location}\nContact: ${value}\n\nStaff will contact you if the item is found.`,
        {
          success: true,
        }
      );
    }
  }

  function handleQuickAction(action) {
    if (action === "Ask another FAQ") {
      setFaqOpen(true);
      return;
    }

    if (action === "Emergency Help") {
      startCategory("Emergency");
      return;
    }

    if (action === "Report Lost Item") {
      startCategory("Lost Item");
      return;
    }

    handleFaqTopic(action);
  }

  function handleSend() {
    if (category === "FAQ") handleFaqFreeText();
    if (category === "Emergency") handleEmergencyStep();
    if (category === "Lost Item") handleLostItemStep();
  }

  const selectedConfig = CATEGORY_CONFIG.find((item) => item.key === category);
  const HeaderIcon = selectedConfig?.icon;

  const isDone =
    (category === "Emergency" && emergencyStep === 2) ||
    (category === "Lost Item" && lostStep === 3);

  const inputPlaceholder =
    category === "FAQ"
      ? "Type your question..."
      : category === "Emergency"
      ? emergencyStep === 0
        ? "Example: near lake trail..."
        : "Describe the emergency..."
      : lostStep === 0
      ? "Describe your lost item..."
      : lostStep === 1
      ? "Where did you last see it?"
      : "Your contact number...";

  if (!category) {
  return (
    <div className="visitorChatMenuContent">
      <div className="visitorChatHome">
        <div className="visitorChatHomeIcon">
          <Bot size={32} />
        </div>

        <h2>AI Chatbot Assistance</h2>
        <p>How can I help you during your visit today?</p>
      </div>

      <div className="visitorChatCategoryList">
        {CATEGORY_CONFIG.map(({ key, label, icon: Icon, tone, desc }) => (
          <button
            key={key}
            className={`visitorChatCategoryCard ${tone}`}
            onClick={() => startCategory(key)}
          >
            <div className="visitorChatCategoryIcon">
              <Icon size={22} />
            </div>

            <div>
              <strong>{label}</strong>
              <span>{desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

  return (
    <div className={`visitorChatShell ${selectedConfig.tone}`}>
      <div className="visitorChatTopBar">
        <button className="visitorChatIconButton" onClick={goBackToMenu}>
          <ChevronLeft size={19} />
        </button>

        <div className="visitorChatHeaderIcon">
          <HeaderIcon size={19} />
        </div>

        <div className="visitorChatHeaderText">
          <strong>{selectedConfig.label}</strong>
          <span>AI Chatbot · Taman Botani Johor</span>
        </div>
      </div>

      <div className="visitorChatMessages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`visitorMessageRow ${
              message.sender === "visitor" ? "isVisitor" : "isBot"
            }`}
          >
            {message.sender === "bot" && (
              <div className="visitorMessageAvatar">
                <Bot size={15} />
              </div>
            )}

            <div className="visitorMessageContent">
              <div
                className={`visitorMessageBubble ${
                  message.urgent ? "urgent" : ""
                } ${message.success ? "success" : ""} ${
                  message.escalated ? "escalated" : ""
                }`}
              >
                {message.success && <CheckCircle2 size={15} />}
                {message.urgent && !message.success && <PhoneCall size={15} />}
                {message.escalated && <AlertTriangle size={15} />}
                <p>{message.text}</p>
              </div>

              {message.quickActions?.length > 0 && (
                <div className="visitorQuickActions">
                  {message.quickActions.map((action) => (
                    <button key={action} onClick={() => handleQuickAction(action)}>
                      {action}
                    </button>
                  ))}
                </div>
              )}

              <span className="visitorMessageTime">
                {formatTime(message.time)}
              </span>
            </div>
          </div>
        ))}

        {typing && (
          <div className="visitorMessageRow isBot">
            <div className="visitorMessageAvatar">
              <Bot size={15} />
            </div>

            <div className="visitorTypingBubble">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {category === "FAQ" && !faqOpen && !isDone && (
          <button
            className="visitorBrowseFaqButton"
            onClick={() => setFaqOpen(true)}
          >
            Browse FAQ topics
            <ChevronDown size={14} />
          </button>
        )}

        {faqOpen && (
          <div className="visitorFaqPanel">
            {FAQ_DATA.map(({ topic, icon: Icon }) => (
              <button key={topic} onClick={() => handleFaqTopic(topic)}>
                <Icon size={15} />
                {topic}
              </button>
            ))}

            <button
              className="visitorFaqCloseButton"
              onClick={() => setFaqOpen(false)}
            >
              <X size={14} />
              Close topics
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!isDone ? (
        <div className="visitorChatInputBar">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSend();
            }}
            placeholder={inputPlaceholder}
          />

          <button
            className="visitorSendButton"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send size={17} />
          </button>
        </div>
      ) : (
        <div className="visitorChatDoneBar">
          <button onClick={goBackToMenu}>Back to Main Menu</button>
        </div>
      )}
    </div>
  );
}
