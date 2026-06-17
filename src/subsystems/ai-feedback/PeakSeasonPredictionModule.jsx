import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  BarChart3,
  ClipboardList,
  Landmark,
  Users,
  AlertTriangle,
  CalendarSearch,
} from "lucide-react";
import { BackButton, PageHeader } from "./AiFeedbackShared";
import "./AiFeedback.css";

const INITIAL_SEASONS = [
  {
    prediction_id: 1,
    season_label: "Hari Raya 2026",
    period_start: "2026-03-30",
    period_end: "2026-04-05",
    predicted_peak_count: 980,
    severity_level: "High",
    season_type: "Public Holiday",
    generated_at: "2026-05-10T09:00:00",
    status: "Past",
    growth_rate: 12.4,
    growth_trend: "Increasing",
    comparison_enabled: true,
    event_impact_enabled: false,
    event_name: "",
    event_impact_count: 0,
    event_impact_percent: 0,
    actual_average_count: 920,
    previous_average_count: 818,
    recommendations: [
      {
        recommendation_id: 1,
        priority: "High",
        text: "Deploy additional staff at the main entrance and parking area.",
      },
      {
        recommendation_id: 2,
        priority: "Medium",
        text: "Prepare temporary queue barriers for peak check-in time.",
      },
    ],
    actual_records: [
      { actual_id: 1, actual_date: "2026-03-30", actual_count: 890 },
      { actual_id: 2, actual_date: "2026-03-31", actual_count: 940 },
      { actual_id: 3, actual_date: "2026-04-01", actual_count: 980 },
    ],
  },
  {
    prediction_id: 2,
    season_label: "School Holiday June",
    period_start: "2026-05-30",
    period_end: "2026-06-15",
    predicted_peak_count: 750,
    severity_level: "Medium",
    season_type: "School Holiday",
    generated_at: "2026-05-20T11:30:00",
    status: "Ongoing",
    growth_rate: 7.2,
    growth_trend: "Increasing",
    comparison_enabled: true,
    event_impact_enabled: true,
    event_name: "Nature Learning Camp",
    event_impact_count: 95,
    event_impact_percent: 12.6,
    actual_average_count: 710,
    previous_average_count: 662,
    recommendations: [
      {
        recommendation_id: 3,
        priority: "Medium",
        text: "Increase patrol frequency near family picnic and education zones.",
      },
      {
        recommendation_id: 4,
        priority: "Low",
        text: "Prepare additional information counter support during weekends.",
      },
    ],
    actual_records: [
      { actual_id: 4, actual_date: "2026-05-30", actual_count: 690 },
      { actual_id: 5, actual_date: "2026-06-01", actual_count: 720 },
      { actual_id: 6, actual_date: "2026-06-05", actual_count: 750 },
    ],
  },
  {
    prediction_id: 3,
    season_label: "Merdeka Weekend",
    period_start: "2026-08-29",
    period_end: "2026-08-31",
    predicted_peak_count: 1100,
    severity_level: "High",
    season_type: "Public Holiday",
    generated_at: "2026-05-22T14:10:00",
    status: "Upcoming",
    growth_rate: 15.8,
    growth_trend: "Increasing",
    comparison_enabled: true,
    event_impact_enabled: true,
    event_name: "Merdeka Eco Walk",
    event_impact_count: 180,
    event_impact_percent: 16.4,
    actual_average_count: 0,
    previous_average_count: 949,
    recommendations: [
      {
        recommendation_id: 5,
        priority: "High",
        text: "Open extra entry lanes and prepare crowd control support.",
      },
      {
        recommendation_id: 6,
        priority: "High",
        text: "Coordinate with parking management before the holiday weekend.",
      },
    ],
    actual_records: [],
  },
];

const PERIOD_OPTIONS = [
  {
    value: "current_year",
    label: "Current Year",
    description: "Analyze seasons within this year.",
  },
  {
    value: "upcoming_year",
    label: "Upcoming Year",
    description: "Predict future high-traffic seasons.",
  },
];

const SEASON_TYPES = [
  "Public Holiday",
  "School Holiday",
  "Tourism Season",
  "Event Season",
];

function getSeverityClass(level) {
  if (level === "High") return "psHigh";
  if (level === "Medium") return "psMedium";
  return "psLow";
}

function getSeverityBadge(level) {
  if (level === "High") return "danger";
  if (level === "Medium") return "warn";
  return "good";
}

function getStatusBadge(status) {
  if (status === "Upcoming") return "warn";
  if (status === "Ongoing") return "good";
  return "";
}

function getTrendIcon(trend) {
  if (trend === "Increasing") return <TrendingUp size={14} />;
  if (trend === "Decreasing") return <TrendingDown size={14} />;
  return <Minus size={14} />;
}

function getTrendClass(trend) {
  if (trend === "Increasing") return "psTrendUp";
  if (trend === "Decreasing") return "psTrendDown";
  return "psTrendStable";
}

function getRecommendationClass(priority) {
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warn";
  return "good";
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function detectSeasonLabel(period, seasonType) {
  if (seasonType === "Public Holiday") {
    return period === "upcoming_year"
      ? "Upcoming Public Holiday Peak"
      : "Current Public Holiday Peak";
  }

  if (seasonType === "School Holiday") {
    return period === "upcoming_year"
      ? "Upcoming School Holiday Peak"
      : "Current School Holiday Peak";
  }

  if (seasonType === "Event Season") {
    return "Event-Based Peak Season";
  }

  return "Tourism Season Peak";
}

function createPrediction({
  analysisPeriod,
  seasonType,
  enableComparison,
  enableEventImpact,
  eventName,
  eventExpectedVisitors,
}) {
  const base =
    seasonType === "Public Holiday"
      ? 920
      : seasonType === "School Holiday"
      ? 780
      : seasonType === "Event Season"
      ? 700
      : 650;

  const periodBonus = analysisPeriod === "upcoming_year" ? 85 : 30;
  const eventImpact = enableEventImpact ? Number(eventExpectedVisitors || 0) : 0;
  const predicted = Math.round(base + periodBonus + eventImpact * 0.55);

  const severity =
    predicted >= 900 ? "High" : predicted >= 650 ? "Medium" : "Low";

  const previousAverage = Math.round(base * 0.88);
  const growthRate = enableComparison
    ? Number((((predicted - previousAverage) / previousAverage) * 100).toFixed(1))
    : 0;

  const growthTrend =
    growthRate > 5 ? "Increasing" : growthRate < -5 ? "Decreasing" : "Stable";

  const generatedId = Date.now();

  return {
    prediction_id: generatedId,
    season_label: detectSeasonLabel(analysisPeriod, seasonType),
    period_start:
      analysisPeriod === "upcoming_year" ? "2027-01-01" : "2026-07-01",
    period_end:
      analysisPeriod === "upcoming_year" ? "2027-12-31" : "2026-12-31",
    predicted_peak_count: predicted,
    severity_level: severity,
    season_type: seasonType,
    generated_at: new Date().toISOString(),
    status: "Upcoming",
    growth_rate: growthRate,
    growth_trend: growthTrend,
    comparison_enabled: enableComparison,
    event_impact_enabled: enableEventImpact,
    event_name: enableEventImpact ? eventName || "Planned Event" : "",
    event_impact_count: eventImpact,
    event_impact_percent:
      eventImpact > 0 ? Number(((eventImpact / predicted) * 100).toFixed(1)) : 0,
    actual_average_count: 0,
    previous_average_count: previousAverage,
    recommendations: [
      {
        recommendation_id: generatedId + 1,
        priority: severity === "High" ? "High" : "Medium",
        text:
          severity === "High"
            ? "Prepare additional staff, open extra entry lanes, and monitor crowded zones closely."
            : "Schedule enough staff for expected visitor growth and prepare crowd monitoring support.",
      },
      {
        recommendation_id: generatedId + 2,
        priority: enableEventImpact ? "High" : "Low",
        text: enableEventImpact
          ? "Coordinate event crowd flow, parking, and visitor guidance before the event date."
          : "Continue monitoring historical trends and update prediction when more data is available.",
      },
    ],
    actual_records: [],
  };
}

export function PeakSeasonPredictionModule({ onBack }) {
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [seasons, setSeasons] = useState(INITIAL_SEASONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    analysisPeriod: "upcoming_year",
    seasonType: "Public Holiday",
    enableComparison: true,
    enableEventImpact: false,
    eventName: "",
    eventExpectedVisitors: "",
  });

  const highSeverityCount = seasons.filter(
    (season) => season.severity_level === "High"
  ).length;

  const upcomingCount = seasons.filter(
    (season) => season.status === "Upcoming"
  ).length;

  const averageGrowth = useMemo(() => {
    const comparable = seasons.filter((season) => season.comparison_enabled);
    if (!comparable.length) return "0.0";

    return (
      comparable.reduce((total, season) => total + season.growth_rate, 0) /
      comparable.length
    ).toFixed(1);
  }, [seasons]);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function generatePrediction() {
    if (!form.analysisPeriod) {
      setError("Please select an analysis period.");
      return;
    }

    if (!form.seasonType) {
      setError("Please select a season type.");
      return;
    }

    if (form.enableEventImpact && !form.eventName.trim()) {
      setError("Please enter the event name for event impact prediction.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      const result = createPrediction(form);

      setSeasons((prev) => [result, ...prev]);
      setSelected(result);
      setDetailTab("overview");
      setLoading(false);
      setView("detail");
    }, 900);
  }

  if (view === "generate") {
    return (
      <div className="peakSeasonPage psFormPage">
        <BackButton
          onBack={() => setView("dashboard")}
          label="Back to Peak Seasons"
        />

        <PageHeader
          icon={CalendarSearch}
          title="Generate Peak Season Prediction"
          description="Select analysis period, season type, and optional event impact."
        />

        <div className="psGenerateWideLayout">
          <section className="panel psFormPanel">
            <label className="psSectionLabel">Step 1 — Analysis Period</label>

            <div className="psOptionGrid">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`psOptionCard ${
                    form.analysisPeriod === option.value ? "isSelected" : ""
                  }`}
                  onClick={() => updateForm("analysisPeriod", option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>

            <label className="psSectionLabel">Step 2 — Season Type</label>

            <select
              value={form.seasonType}
              onChange={(event) => updateForm("seasonType", event.target.value)}
              className="psSelect"
            >
              {SEASON_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <div className="psCheckGrid">
              <label className="psSwitchRow">
                <input
                  type="checkbox"
                  checked={form.enableComparison}
                  onChange={(event) =>
                    updateForm("enableComparison", event.target.checked)
                  }
                />
                Compare seasonal visitor growth
              </label>

              <label className="psSwitchRow">
                <input
                  type="checkbox"
                  checked={form.enableEventImpact}
                  onChange={(event) =>
                    updateForm("enableEventImpact", event.target.checked)
                  }
                />
                Predict event impact on visitors
              </label>
            </div>

            {form.enableEventImpact && (
              <div className="psEventFields">
                <label>
                  Event name
                  <input
                    value={form.eventName}
                    onChange={(event) =>
                      updateForm("eventName", event.target.value)
                    }
                    placeholder="Example: Merdeka Eco Walk"
                  />
                </label>

                <label>
                  Expected event participants
                  <input
                    type="number"
                    min="0"
                    value={form.eventExpectedVisitors}
                    onChange={(event) =>
                      updateForm("eventExpectedVisitors", event.target.value)
                    }
                    placeholder="Example: 200"
                  />
                </label>
              </div>
            )}

            {error && <p className="psErrorText">{error}</p>}

            <button
              className={`primaryButton psFullButton ${
                loading ? "isLoading" : ""
              }`}
              onClick={generatePrediction}
              disabled={loading}
            >
              <RefreshCw size={16} />
              {loading ? "Generating prediction..." : "Generate Prediction"}
            </button>
          </section>

          <aside className="panel psPreviewPanel">
            <h2>Prediction Setup Preview</h2>
            <p>
              This preview summarizes the selected options before generating the
              prediction result.
            </p>

            <div className="psPreviewList">
              <div>
                <span>Analysis period</span>
                <strong>
                  {form.analysisPeriod === "upcoming_year"
                    ? "Upcoming Year"
                    : "Current Year"}
                </strong>
              </div>

              <div>
                <span>Season type</span>
                <strong>{form.seasonType}</strong>
              </div>

              <div>
                <span>Seasonal comparison</span>
                <strong>
                  {form.enableComparison ? "Enabled" : "Not enabled"}
                </strong>
              </div>

              <div>
                <span>Event impact</span>
                <strong>
                  {form.enableEventImpact ? "Enabled" : "Not enabled"}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (view === "detail" && selected) {
    const severityClass = getSeverityClass(selected.severity_level);

    const comparisonChartData = [
      {
        label: "Previous Season",
        shortLabel: "Previous",
        className: "previous",
        values: [520, 610, 580, 660, selected.previous_average_count],
      },
      {
        label: "Predicted Season",
        shortLabel: "Predicted",
        className: "predicted",
        values: [610, 700, 680, 760, selected.predicted_peak_count],
      },
      {
        label: "With Event Impact",
        shortLabel: "Event Impact",
        className: "event",
        values: [
          650,
          760,
          730,
          840,
          selected.event_impact_enabled
            ? selected.predicted_peak_count + selected.event_impact_count
            : selected.predicted_peak_count + 80,
        ],
      },
    ];

    const chartLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Peak"];

    const rawChartMax = Math.max(
      ...comparisonChartData.flatMap((series) => series.values),
      1
    );

    const chartMaxValue = Math.ceil(rawChartMax / 100) * 100;
    const chartMinValue = 0;
    const chartWidth = 760;
    const chartHeight = 330;
    const chartPadding = {
      top: 34,
      right: 34,
      bottom: 54,
      left: 64,
    };

    function getChartX(index) {
      const usableWidth = chartWidth - chartPadding.left - chartPadding.right;

      return (
        chartPadding.left +
        (index / (comparisonChartData[0].values.length - 1)) * usableWidth
      );
    }

    function getChartY(value) {
      const usableHeight = chartHeight - chartPadding.top - chartPadding.bottom;

      return (
        chartPadding.top +
        ((chartMaxValue - value) / (chartMaxValue - chartMinValue)) *
          usableHeight
      );
    }

    function createLinePath(values) {
      return values
        .map((value, index) => {
          const command = index === 0 ? "M" : "L";
          return `${command} ${getChartX(index)} ${getChartY(value)}`;
        })
        .join(" ");
    }

    function createAreaPath(values) {
      const linePath = createLinePath(values);
      const lastX = getChartX(values.length - 1);
      const firstX = getChartX(0);
      const baseY = chartHeight - chartPadding.bottom;

      return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
    }

    return (
      <div className="peakSeasonPage">
        <BackButton
          onBack={() => setView("dashboard")}
          label="Back to Peak Seasons"
        />

        <PageHeader
          icon={CalendarDays}
          title={selected.season_label}
          description={`${formatDisplayDate(selected.period_start)} → ${formatDisplayDate(
            selected.period_end
          )} · ${selected.season_type}`}
        />

        <div className={`panel psHero ${severityClass}`}>
          <div>
            <span className="psHeroLabel">Predicted Peak Count</span>
            <strong>{selected.predicted_peak_count}</strong>
            <p>Generated at {formatDisplayDate(selected.generated_at)}</p>
          </div>

          <span className={`aiBadge ${getSeverityBadge(selected.severity_level)}`}>
            <div className="aiBadgeDot" />
            {selected.severity_level} Severity
          </span>
        </div>

        <div className="metricRow psMetricRow">
          {[
            {
              label: "Peak Count",
              value: selected.predicted_peak_count,
              icon: Users,
            },
            {
              label: "Growth Rate",
              value: selected.comparison_enabled
                ? `${selected.growth_rate > 0 ? "+" : ""}${selected.growth_rate}%`
                : "Not enabled",
              icon: TrendingUp,
            },
            {
              label: "Previous Avg",
              value: selected.previous_average_count,
              icon: BarChart3,
            },
            {
              label: "Event Impact",
              value: selected.event_impact_enabled
                ? `+${selected.event_impact_count}`
                : "Not enabled",
              icon: Landmark,
            },
          ].map(({ label, value, icon: Icon }) => (
            <section key={label} className="metric">
              <div className="metricIcon">
                <Icon size={22} />
              </div>
              <span>{label}</span>
              <strong>{value}</strong>
            </section>
          ))}
        </div>

        <div className="psTabs">
          {[
            ["overview", "Overview", BarChart3],
            ["comparison", "Seasonal Comparison", TrendingUp],
            ["event", "Event Impact", Landmark],
            ["recommendations", "Recommendations", ClipboardList],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              className={detailTab === key ? "primaryButton" : "ghostButton"}
              onClick={() => setDetailTab(key)}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {detailTab === "overview" && (
          <div className="panel">
            <div className="panelHeader">
              <div>
                <h2>Prediction Overview</h2>
                <p>Summary of the detected peak season.</p>
              </div>
            </div>

            <div className="statusStack">
              <div className={`statusItem ${getSeverityBadge(selected.severity_level)}`}>
                <AlertTriangle size={18} />
                <div>
                  <strong>{selected.severity_level} Crowd Severity</strong>
                  <span>
                    The predicted maximum daily visitor count is{" "}
                    {selected.predicted_peak_count}.
                  </span>
                </div>
              </div>

              <div className="statusItem good">
                <CheckCircle2 size={18} />
                <div>
                  <strong>Recurring Peak Pattern Detected</strong>
                  <span>
                    The selected period matches recurring high-traffic patterns
                    from historical visitor records.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {detailTab === "comparison" && (
          <div className="panel">
            <div className="panelHeader">
              <div>
                <h2>Seasonal Visitor Growth</h2>
                <p>
                  Comparison of previous season, predicted season, and event
                  impact visitor pattern.
                </p>
              </div>
            </div>

            {selected.comparison_enabled ? (
              <>
                <div className={`psComparisonBanner ${getTrendClass(selected.growth_trend)}`}>
                  {getTrendIcon(selected.growth_trend)}
                  <div>
                    <strong>{selected.growth_trend} Trend</strong>
                    <p>
                      Visitor volume is predicted to change by{" "}
                      {selected.growth_rate > 0 ? "+" : ""}
                      {selected.growth_rate}% compared with the previous season.
                    </p>
                  </div>
                </div>

                <div className="psAdvancedChartCard">
                  <div className="psChartTop">
                    <div>
                      <span>Seasonal comparison</span>
                      <strong>Visitor Trend Projection</strong>
                    </div>

                    <div className="psChartValuePill">
                      Peak {selected.predicted_peak_count} visitors
                    </div>
                  </div>

                  <div className="psAdvancedChartScroll">
                    <svg
                      className="psAdvancedLineChart"
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      role="img"
                      aria-label="Seasonal visitor comparison line chart"
                    >
                      <defs>
                        <linearGradient
                          id="previousGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity="0.18"
                          />
                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity="0"
                          />
                        </linearGradient>

                        <linearGradient
                          id="predictedGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ef4444"
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ef4444"
                            stopOpacity="0"
                          />
                        </linearGradient>

                        <linearGradient
                          id="eventGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#84cc16"
                            stopOpacity="0.22"
                          />
                          <stop
                            offset="100%"
                            stopColor="#84cc16"
                            stopOpacity="0"
                          />
                        </linearGradient>

                        <filter
                          id="chartShadow"
                          x="-20%"
                          y="-20%"
                          width="140%"
                          height="140%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="8"
                            stdDeviation="8"
                            floodColor="#10241a"
                            floodOpacity="0.14"
                          />
                        </filter>
                      </defs>

                      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const y =
                          chartPadding.top +
                          ratio *
                            (chartHeight -
                              chartPadding.top -
                              chartPadding.bottom);

                        const value = Math.round(
                          chartMaxValue -
                            ratio * (chartMaxValue - chartMinValue)
                        );

                        return (
                          <g key={ratio}>
                            <line
                              x1={chartPadding.left}
                              x2={chartWidth - chartPadding.right}
                              y1={y}
                              y2={y}
                              className="psAdvancedGridLine"
                            />

                            <text
                              x={chartPadding.left - 14}
                              y={y + 4}
                              textAnchor="end"
                              className="psAdvancedAxisText"
                            >
                              {value}
                            </text>
                          </g>
                        );
                      })}

                      {chartLabels.map((label, index) => (
                        <g key={label}>
                          <line
                            x1={getChartX(index)}
                            x2={getChartX(index)}
                            y1={chartPadding.top}
                            y2={chartHeight - chartPadding.bottom}
                            className="psAdvancedVerticalGrid"
                          />

                          <text
                            x={getChartX(index)}
                            y={chartHeight - 18}
                            textAnchor="middle"
                            className="psAdvancedAxisText"
                          >
                            {label}
                          </text>
                        </g>
                      ))}

                      <line
                        x1={chartPadding.left}
                        x2={chartPadding.left}
                        y1={chartPadding.top}
                        y2={chartHeight - chartPadding.bottom}
                        className="psAdvancedAxisLine"
                      />

                      <line
                        x1={chartPadding.left}
                        x2={chartWidth - chartPadding.right}
                        y1={chartHeight - chartPadding.bottom}
                        y2={chartHeight - chartPadding.bottom}
                        className="psAdvancedAxisLine"
                      />

                      {comparisonChartData.map((series) => (
                        <path
                          key={`${series.label}-area`}
                          d={createAreaPath(series.values)}
                          className={`psAreaFill ${series.className}`}
                        />
                      ))}

                      {comparisonChartData.map((series) => (
                        <g
                          key={series.label}
                          className={`psAdvancedSeries ${series.className}`}
                        >
                          <path d={createLinePath(series.values)} />

                          {series.values.map((value, index) => (
                            <g
                              key={`${series.label}-${index}`}
                              className="psPointGroup"
                            >
                              <circle
                                className="psPointHalo"
                                cx={getChartX(index)}
                                cy={getChartY(value)}
                                r="13"
                              />

                              <circle
                                className="psPoint"
                                cx={getChartX(index)}
                                cy={getChartY(value)}
                                r="6"
                              />

                              <foreignObject
                                x={getChartX(index) - 62}
                                y={getChartY(value) - 58}
                                width="124"
                                height="42"
                                className="psTooltipObject"
                              >
                                <div className="psChartTooltip">
                                  <strong>{series.shortLabel}</strong>
                                  <span>{value} visitors</span>
                                </div>
                              </foreignObject>
                            </g>
                          ))}
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className="psAdvancedLegend">
                    {comparisonChartData.map((series) => (
                      <div
                        key={series.label}
                        className={`psAdvancedLegendItem ${series.className}`}
                      >
                        <span />
                        <strong>{series.label}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="psMutedText">
                Seasonal comparison was not enabled for this prediction.
              </p>
            )}
          </div>
        )}

        {detailTab === "event" && (
          <div className="panel">
            <div className="panelHeader">
              <div>
                <h2>Event Impact Prediction</h2>
                <p>Estimated effect of planned event on visitor count.</p>
              </div>
            </div>

            {selected.event_impact_enabled ? (
              <div className="psEventImpact">
                <div>
                  <span>Event</span>
                  <strong>{selected.event_name}</strong>
                </div>

                <div>
                  <span>Extra Visitors</span>
                  <strong>+{selected.event_impact_count}</strong>
                </div>

                <div>
                  <span>Impact Share</span>
                  <strong>{selected.event_impact_percent}%</strong>
                </div>
              </div>
            ) : (
              <p className="psMutedText">
                Event impact prediction was not enabled for this result.
              </p>
            )}
          </div>
        )}

        {detailTab === "recommendations" && (
          <div className="panel">
            <div className="panelHeader">
              <div>
                <h2>Management Recommendations</h2>
                <p>Recommended actions generated from prediction severity.</p>
              </div>
            </div>

            <div className="psRecommendationList">
              {selected.recommendations.map((item) => (
                <div
                  key={item.recommendation_id}
                  className={`statusItem ${getRecommendationClass(item.priority)}`}
                >
                  <ClipboardList size={18} />
                  <div>
                    <strong>{item.priority} Priority</strong>
                    <span>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="peakSeasonPage">
      <BackButton onBack={onBack} />

      <PageHeader
        icon={CalendarDays}
        title="Peak Season Prediction"
        description=""
      />

      <div className="metricRow psMetricRow">
        {[
          {
            label: "Upcoming Peaks",
            value: upcomingCount,
            icon: CalendarDays,
          },
          {
            label: "High Severity",
            value: highSeverityCount,
            icon: AlertTriangle,
          },
          {
            label: "Average Growth",
            value: `+${averageGrowth}%`,
            icon: TrendingUp,
          },
          {
            label: "Total Predictions",
            value: seasons.length,
            icon: BarChart3,
          },
        ].map(({ label, value, icon: Icon }) => (
          <section key={label} className="metric">
            <div className="metricIcon">
              <Icon size={22} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
          </section>
        ))}
      </div>

      <div className="panelHeader psDashboardHeader">
        <div>
          <h2>Peak Season Results</h2>
        </div>

        <button className="primaryButton" onClick={() => setView("generate")}>
          <RefreshCw size={16} />
          New Prediction
        </button>
      </div>

      <div className="panel psTablePanel">
        <table className="dataTable">
          <thead>
            <tr>
              <th>Season</th>
              <th>Period</th>
              <th>Type</th>
              <th>Peak Count</th>
              <th>Severity</th>
              <th>Growth</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {seasons.map((season) => (
              <tr key={season.prediction_id}>
                <td>
                  <strong>{season.season_label}</strong>
                </td>

                <td className="psSmallText">
                  {formatDisplayDate(season.period_start)} →{" "}
                  {formatDisplayDate(season.period_end)}
                </td>

                <td>
                  <span className="aiBadge good">{season.season_type}</span>
                </td>

                <td>
                  <strong className="psCountText">
                    {season.predicted_peak_count}
                  </strong>
                </td>

                <td>
                  <span className={`aiBadge ${getSeverityBadge(season.severity_level)}`}>
                    <div className="aiBadgeDot" />
                    {season.severity_level}
                  </span>
                </td>

                <td>
                  <div className={`psGrowthText ${getTrendClass(season.growth_trend)}`}>
                    {getTrendIcon(season.growth_trend)}
                    {season.comparison_enabled
                      ? `${season.growth_rate > 0 ? "+" : ""}${season.growth_rate}%`
                      : "N/A"}
                  </div>
                </td>

                <td>
                  <span className={`aiBadge ${getStatusBadge(season.status)}`}>
                    <div className="aiBadgeDot" />
                    {season.status}
                  </span>
                </td>

                <td>
                  <button
                    className="ghostButton psDetailsButton"
                    onClick={() => {
                      setSelected(season);
                      setDetailTab("overview");
                      setView("detail");
                    }}
                  >
                    Details
                    <ChevronRight size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
