import React, { useState } from "react";
import {
  TrendingUp,
  RefreshCw,
  Users,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Info,
  BarChart3,
  Trash2,
} from "lucide-react";
import { BackButton, PageHeader } from "./AiFeedbackShared";
import "./AiFeedback.css";

const PUBLIC_HOLIDAYS = [
  { date: "2026-06-07", name: "Hari Keputeraan Agong" },
  { date: "2026-08-31", name: "Hari Merdeka" },
  { date: "2026-09-16", name: "Hari Malaysia" },
  { date: "2026-12-25", name: "Krismas" },
];

const HISTORICAL_BASELINE = {
  Weekday: { avg: 145, min: 90, max: 210 },
  Weekend: { avg: 310, min: 240, max: 420 },
  "Public Holiday": { avg: 520, min: 400, max: 680 },
};

const TYPE_CONFIG = {
  Weekday: { sub: "Mon – Fri" },
  Weekend: { sub: "Sat – Sun" },
  "Public Holiday": { sub: "National holidays" },
};

const INITIAL_HISTORY = [
  {
    id: 1,
    date: "2026-06-07",
    type: "Weekend",
    predicted: 320,
    lower: 290,
    upper: 350,
    confidence: 87.5,
    model: "Gemini AI",
    generatedAt: "2026-06-01T08:00:00",
    holidayWarning: null,
    staffing: {
      total: 8,
      entrance: 3,
      patrol: 4,
      info: 1,
      note: "Standard staffing with one extra patrol recommended.",
    },
    staffingConfirmed: false,
  },
];


function formatDisplayDate(dateStr) {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
function isWeekend(dateStr) {
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}

function getDateType(dateStr) {
  if (!dateStr) return null;
  if (PUBLIC_HOLIDAYS.some((h) => h.date === dateStr)) return "Public Holiday";
  if (isWeekend(dateStr)) return "Weekend";
  return "Weekday";
}

function getTypeClass(type) {
  if (type === "Public Holiday") return "vfTypePublicHoliday";
  if (type === "Weekend") return "vfTypeWeekend";
  return "vfTypeWeekday";
}

function generateForecast(type, date) {
  const base = HISTORICAL_BASELINE[type];
  const seed = date.split("-").reduce((a, b) => a + Number(b), 0);
  const jitter = (seed % 40) - 20;

  let predicted = Math.round(base.avg + jitter);
  let holidayWarning = null;

  if (type === "Weekend") {
    const overlap = PUBLIC_HOLIDAYS.find((h) => h.date === date);
    if (overlap) {
      holidayWarning = overlap.name;
      predicted = Math.round(predicted * 1.35);
    }
  }

  const confidence =
    type === "Public Holiday" ? 83 : type === "Weekend" ? 87 : 91;

  const staffTotal = Math.ceil(predicted / 40);

  return {
    id: Date.now(),
    date,
    type,
    predicted,
    lower: Math.round(base.min + jitter * 0.5),
    upper: Math.round(base.max + jitter * 0.5),
    confidence,
    model: "Gemini AI",
    generatedAt: new Date().toISOString(),
    holidayWarning,
    staffing: {
      total: staffTotal,
      entrance: Math.ceil(predicted / 120),
      patrol: Math.ceil(predicted / 80),
      info: Math.ceil(predicted / 150),
      note:
        predicted > 400
          ? "High visitor volume. Deploy additional crowd control staff."
          : predicted > 250
          ? "Moderate volume. Standard staffing with one extra patrol recommended."
          : "Normal volume. Standard staffing is sufficient.",
    },
    staffingConfirmed: false,
    adjustedTotal: "",
  };
}

export function VisitorForecastingModule({ onBack }) {
  const [view, setView] = useState("dashboard");
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [selected, setSelected] = useState(null);

  const [forecastType, setForecastType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  function handleGenerate() {
    if (!forecastType) {
      setError("Please select a forecast type.");
      return;
    }

    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      const effectiveType = getDateType(selectedDate) || forecastType;
      const result = generateForecast(effectiveType, selectedDate);

      setHistory((prev) => [result, ...prev]);
      setSelected(result);
      setLoading(false);
      setView("detail");
    }, 1600);
  }

  function resetGenerate() {
    setForecastType("");
    setSelectedDate("");
    setError("");
  }

  if (view === "dashboard") {
    return (
      <div className="visitorForecastingPage">
        <BackButton onBack={onBack} />

        <PageHeader
          icon={TrendingUp}
          title="Visitor Forecasting"
          //description="AI-generated visitor count predictions by forecast type — weekday, weekend, or public holiday."
        />

        <div className="metricRow vfMetricRow">
          {[
            { label: "Total Forecasts", value: history.length },
            {
              label: "Weekday",
              value: history.filter((f) => f.type === "Weekday").length,
            },
            {
              label: "Weekend",
              value: history.filter((f) => f.type === "Weekend").length,
            },
            {
              label: "Public Holiday",
              value: history.filter((f) => f.type === "Public Holiday").length,
            },
          ].map(({ label, value }) => (
            <section key={label} className="metric">
              <div className="metricIcon">
                <TrendingUp size={22} />
              </div>
              <span>{label}</span>
              <strong>{value}</strong>
            </section>
          ))}
        </div>

        <div className="panelHeader">
          <div>
            <h2>Forecast History</h2>
            <p>Click a forecast to view details and staffing.</p>
          </div>

          <button
            className="primaryButton"
            onClick={() => {
              resetGenerate();
              setView("generate");
            }}
          >
            <RefreshCw size={16} />
            New Forecast
          </button>
        </div>

        <div className="vfHistoryList">
          {history.map((f) => (
            <div
              key={f.id}
              className={`aiModuleCard vfHistoryCard ${getTypeClass(f.type)}`}
            >
              <div className="vfHistoryMain">
                <div className="vfHistoryDot vfTypeDot" />

                <div>
                  <div className="vfHistoryTitleRow">
                    <strong>{formatDisplayDate(f.date)}</strong>
                    <span className="vfTypeBadge">{f.type}</span>
                    {f.holidayWarning && (
                      <AlertTriangle size={14} className="vfTypeText" />
                    )}
                  </div>

                  <p className="vfHistoryMeta">
                    Predicted:{" "}
                    <strong className="vfTypeText">{f.predicted}</strong>{" "}
                    visitors · {formatDisplayDate(f.date)}
                </p>
                </div>
              </div>

              <div className="vfHistoryActions">
                <button
                  className="primaryButton"
                  onClick={() => {
                    setSelected(f);
                    setView("detail");
                  }}
                >
                  <BarChart3 size={14} />
                  View
                </button>

                <button
                  className="ghostButton"
                  onClick={() =>
                    setHistory((prev) => prev.filter((x) => x.id !== f.id))
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "generate") {
    return (
      <div className="visitorForecastingPage">
        <BackButton
          onBack={() => setView("dashboard")}
          label="Back to Forecasts"
        />

        <PageHeader
          icon={RefreshCw}
          title="Generate New Forecast"
          description="Select a forecast type and date. Gemini AI will predict visitor volume."
        />

        <div className="panel vfFormPanel">
          <label className="vfPanelLabel">Step 1 — Select Forecast Type</label>

          <div className="vfTypeGrid">
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <button
                key={type}
                onClick={() => {
                  setForecastType(type);
                  setSelectedDate("");
                  setError("");
                }}
                className={`vfTypeOption ${getTypeClass(type)} ${
                  forecastType === type ? "isSelected" : ""
                }`}
              >
                <strong>{type}</strong>
                <span>{cfg.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {forecastType && (
          <div className="panel vfFormPanel">
            <label className="vfPanelLabel">Step 2 — Select Date</label>

            {forecastType === "Public Holiday" && (
              <div className="vfHolidayPick">
                <p>Quick pick a public holiday:</p>

                <div className="vfHolidayButtons">
                  {PUBLIC_HOLIDAYS.map((h) => (
                    <button
                      key={h.date}
                      className={`${
                        selectedDate === h.date
                          ? "primaryButton"
                          : "ghostButton"
                      } vfHolidayButton`}
                      onClick={() => {
                        setSelectedDate(h.date);
                        setError("");
                      }}
                    >
                      <span>{h.name}</span>
                      <span className="vfMutedText">{h.date}</span>
                    </button>
                  ))}
                </div>

                <p className="vfCustomDateText">Or enter a custom date:</p>
              </div>
            )}

            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setError("");
              }}
              className="vfDateInput"
            />

            {selectedDate &&
              (() => {
                const detected = getDateType(selectedDate);

                if (detected && detected !== forecastType) {
                  return (
                    <div
                      className={`vfPanelNotice ${getTypeClass(detected)}`}
                    >
                      <Info size={15} className="vfTypeText" />
                      <p>
                        <strong>Note:</strong> This date is a{" "}
                        <strong>{detected}</strong>. The forecast will use{" "}
                        <strong>{detected}</strong> patterns instead.
                      </p>
                    </div>
                  );
                }

                return null;
              })()}
          </div>
        )}

        {error && <p className="vfErrorText">{error}</p>}

        {forecastType && (
          <button
            className={`primaryButton vfFullButton ${
              loading ? "isLoading" : ""
            }`}
            onClick={handleGenerate}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading
              ? "Gemini AI is generating forecast..."
              : "Generate Forecast"}
          </button>
        )}
      </div>
    );
  }

  if (view === "detail" && selected) {
    const typeClass = getTypeClass(selected.type);

    function confirmStaffing() {
      setHistory((prev) =>
        prev.map((f) =>
          f.id === selected.id
            ? {
                ...f,
                staffingConfirmed: true,
                adjustedTotal: selected.adjustedTotal,
              }
            : f
        )
      );

      setSelected((s) => ({ ...s, staffingConfirmed: true }));
    }

    return (
      <div className="visitorForecastingPage">
        <BackButton
          onBack={() => setView("dashboard")}
          label="Back to Forecasts"
        />

        <PageHeader
            icon={BarChart3}
            title="Forecast Result"
            description={`${formatDisplayDate(selected.date)} · ${selected.type}`}
        />

        {selected.holidayWarning && (
          <div className="vfWarningBanner">
            <AlertTriangle size={18} />

            <div>
              <strong>Public Holiday Detected — Adjusted Forecast Applied</strong>
              <p>
                {selected.holidayWarning} falls on this date. A combined
                weekend-holiday multiplier has been applied.
              </p>
            </div>
          </div>
        )}

        <div className={`panel vfHeroMetric vfTypePanel ${typeClass}`}>
          <p className="vfHeroLabel">Predicted Visitor Count</p>
          <strong className="vfHeroCount">{selected.predicted}</strong>

          <p className="vfHeroRange">
            Range: {selected.lower} – {selected.upper} visitors
          </p>

          
        </div>

        <div className="metricRow vfMetricRowCompact">
            {[
                { label: "Forecast Type", value: selected.type },
                {
                label: "Historical Avg",
                value: HISTORICAL_BASELINE[selected.type]?.avg,
                },
                {
                label: "Lower Estimate",
                value: selected.lower,
                },
                {
                label: "Upper Estimate",
                value: selected.upper,
                },
            ].map(({ label, value }) => (
                <section key={label} className="metric">
                <div className="metricIcon">
                    <TrendingUp size={22} />
                </div>
                <span>{label}</span>
                <strong>{value}</strong>
                </section>
            ))}
        </div>

        <div className="panel vfStaffPanel">
          <div className="panelHeader">
            <div>
              <h2>
                <Users size={18} />
                Staffing Recommendation
              </h2>
              <p>Based on predicted {selected.predicted} visitors</p>
            </div>
          </div>

          <div className="statusStack vfStaffStatus">
            <div className="statusItem good">
              <CheckCircle2 size={18} />

              <div>
                <strong>AI Recommendation</strong>
                <span>{selected.staffing.note}</span>
              </div>
            </div>
          </div>

          <div className="vfStaffGrid">
            {[
              { role: "Total Staff Needed", count: selected.staffing.total },
              {
                role: "Entrance / Ticketing",
                count: selected.staffing.entrance,
              },
              {
                role: "Patrol / Security",
                count: selected.staffing.patrol,
              },
              { role: "Info Counter", count: selected.staffing.info },
            ].map(({ role, count }) => (
              <div key={role} className="vfStaffRoleCard">
                <p>{role}</p>
                <strong>{count}</strong>
                <span> staff</span>
              </div>
            ))}
          </div>

          {!selected.staffingConfirmed ? (
            <div>
              <label className="vfStaffLabel">
                Adjust total staff optional:
              </label>

              <div className="vfStaffInputRow">
                <input
                  type="number"
                  min={1}
                  placeholder={selected.staffing.total}
                  value={selected.adjustedTotal || ""}
                  onChange={(e) =>
                    setSelected((s) => ({
                      ...s,
                      adjustedTotal: e.target.value,
                    }))
                  }
                />
                <span>staff total</span>
              </div>

              <button
                className="primaryButton vfFullButton"
                onClick={confirmStaffing}
              >
                <ClipboardList size={16} />
                Confirm Staffing Plan
              </button>
            </div>
          ) : (
            <div className="vfConfirmedPlan">
              <CheckCircle2 size={18} />

              <div>
                <strong>Staffing plan confirmed</strong>
                <p>
                  {selected.adjustedTotal
                    ? `Adjusted to ${selected.adjustedTotal} staff`
                    : `${selected.staffing.total} staff`}{" "}
                  scheduled for {formatDisplayDate(selected.date)}.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="vfActions">
          <button
            className="ghostButton"
            onClick={() => {
              resetGenerate();
              setView("generate");
            }}
          >
            <RefreshCw size={15} />
            New Forecast
          </button>

          <button className="ghostButton" onClick={() => setView("dashboard")}>
            <BarChart3 size={15} />
            All Forecasts
          </button>
        </div>
      </div>
    );
  }

  return null;
}
