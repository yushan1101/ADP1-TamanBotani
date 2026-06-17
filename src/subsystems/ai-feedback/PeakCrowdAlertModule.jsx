import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit3,
  Gauge,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  XCircle,
} from "lucide-react";
import { BackButton, PageHeader } from "./AiFeedbackShared";
import "./AiFeedback.css";

const INITIAL_ALERTS = [
  {
    alert_id: "AL-1001",
    alert_type: "Emergency Crowd",
    severity: "High",
    message: "Visitor count exceeded the emergency threshold at the Main Gate.",
    location: "Main Gate",
    current_count: 1040,
    threshold: 1000,
    status: "Active",
    created_at: "2026-06-03T14:35:00",
    acknowledged_by: "",
    action_taken: "",
  },
  {
    alert_id: "AL-1002",
    alert_type: "Main Gate Congestion",
    severity: "Medium",
    message:
      "Entry rate increased sharply in the last 15 minutes at the Main Gate.",
    location: "Main Gate",
    current_count: 760,
    threshold: 700,
    status: "Active",
    created_at: "2026-06-03T14:20:00",
    acknowledged_by: "",
    action_taken: "",
  },
  {
    alert_id: "AL-1003",
    alert_type: "Warning Crowd",
    severity: "Low",
    message:
      "Visitor count is approaching the warning threshold. Staff should monitor the Main Gate and visitor flow.",
    location: "Main Gate",
    current_count: 610,
    threshold: 650,
    status: "Resolved",
    created_at: "2026-06-03T13:10:00",
    acknowledged_by: "Staff A",
    action_taken: "Additional staff assigned to guide visitors at the Main Gate.",
  },
  {
    alert_id: "AL-1004",
    alert_type: "Main Gate Queue",
    severity: "Medium",
    message:
      "Visitor queue is building up at the Main Gate during the current entry period.",
    location: "Main Gate",
    current_count: 85,
    threshold: 70,
    status: "Resolved",
    created_at: "2026-06-03T12:40:00",
    acknowledged_by: "Staff B",
    action_taken: "Staff redirected visitors into organized queue lanes.",
  },
];

const INITIAL_RULES = [
  {
    rule_id: "R-001",
    rule_name: "Warning Crowd Threshold",
    location: "Park Wide",
    metric: "Current Visitors",
    threshold: 650,
    severity: "Low",
    status: "Active",
  },
  {
    rule_id: "R-002",
    rule_name: "Emergency Crowd Threshold",
    location: "Park Wide",
    metric: "Current Visitors",
    threshold: 1000,
    severity: "High",
    status: "Active",
  },
  {
    rule_id: "R-003",
    rule_name: "Main Gate Entry Threshold",
    location: "Main Gate",
    metric: "Entry Rate / 15 min",
    threshold: 60,
    severity: "Medium",
    status: "Active",
  },
];

const SEVERITY_OPTIONS = ["Low", "Medium", "High"];
const STATUS_OPTIONS = ["Active", "Inactive"];

function getSeverityClass(severity) {
  if (severity === "High") return "pcaHigh";
  if (severity === "Medium") return "pcaMedium";
  return "pcaLow";
}

function getSeverityBadge(severity) {
  if (severity === "High") return "danger";
  if (severity === "Medium") return "warn";
  return "good";
}

function getStatusBadge(status) {
  if (status === "Active") return "danger";
  if (status === "Inactive") return "warn";
  return "good";
}

function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAlertProgress(alert) {
  if (!alert.threshold) return 0;

  return Math.min(
    Math.round((alert.current_count / alert.threshold) * 100),
    140
  );
}

export function PeakCrowdAlertModule({ onBack }) {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [tab, setTab] = useState("live");
  const [sortOrder, setSortOrder] = useState("latest");
  const [search, setSearch] = useState("");
  const [expandedAlertId, setExpandedAlertId] = useState(
    INITIAL_ALERTS[0].alert_id
  );
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleDraft, setRuleDraft] = useState(null);

  const currentVisitors = 760;
  const entryRate = 68;

  const warningThreshold =
    rules.find((rule) => rule.rule_id === "R-001")?.threshold || 650;

  const emergencyThreshold =
    rules.find((rule) => rule.rule_id === "R-002")?.threshold || 1000;

  const crowdPercentage = Math.min(
    Math.round((currentVisitors / emergencyThreshold) * 100),
    100
  );

  const activeAlerts = alerts.filter((alert) => alert.status === "Active");

  const highAlerts = alerts.filter((alert) => alert.severity === "High");

  const crowdLevel =
    currentVisitors >= emergencyThreshold
      ? "Emergency"
      : currentVisitors >= warningThreshold
      ? "Moderate"
      : "Normal";

  const sortedAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        const keyword = search.toLowerCase();

        return (
          alert.alert_id.toLowerCase().includes(keyword) ||
          alert.alert_type.toLowerCase().includes(keyword) ||
          alert.location.toLowerCase().includes(keyword) ||
          alert.message.toLowerCase().includes(keyword) ||
          alert.status.toLowerCase().includes(keyword) ||
          alert.severity.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();

        return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
      });
  }, [alerts, search, sortOrder]);

  function acknowledgeAlert(alertId) {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.alert_id === alertId
          ? {
              ...alert,
              status: "Resolved",
              acknowledged_by: "Current Staff",
              action_taken:
                "Alert reviewed and corrective action has been recorded at the Main Gate.",
            }
          : alert
      )
    );
  }

  function startEditRule(rule) {
    setEditingRuleId(rule.rule_id);
    setRuleDraft({ ...rule });
  }

  function cancelEditRule() {
    setEditingRuleId(null);
    setRuleDraft(null);
  }

  function updateRuleDraft(field, value) {
    setRuleDraft((prev) => ({
      ...prev,
      [field]: field === "threshold" ? Number(value) : value,
    }));
  }

  function saveRule() {
    if (!ruleDraft) return;

    setRules((prev) =>
      prev.map((rule) =>
        rule.rule_id === ruleDraft.rule_id ? { ...ruleDraft } : rule
      )
    );

    setEditingRuleId(null);
    setRuleDraft(null);
  }

  return (
    <div className="peakCrowdAlertPage">
      <BackButton onBack={onBack} label="Back to AI Management" />

      <PageHeader icon={AlertTriangle} title="Peak Crowd Alert" description="" />

      <div className="metricRow pcaMetricRow">
        {[
          {
            label: "Current Visitors",
            value: currentVisitors,
            icon: Users,
            tone: crowdLevel === "Emergency" ? "pcaHigh" : "pcaLow",
          },
          {
            label: "Main Gate Entry / 15 min",
            value: entryRate,
            icon: Gauge,
            tone: entryRate >= 60 ? "pcaMedium" : "pcaLow",
          },
          {
            label: "Active Alerts",
            value: activeAlerts.length,
            icon: Bell,
            tone: activeAlerts.length > 0 ? "pcaHigh" : "pcaLow",
          },
          {
            label: "Active Rules",
            value: rules.filter((rule) => rule.status === "Active").length,
            icon: Settings,
            tone: "pcaLow",
          },
        ].map(({ label, value, icon: Icon, tone }) => (
          <section key={label} className={`metric pcaMetric ${tone}`}>
            <div className="metricIcon">
              <Icon size={22} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
          </section>
        ))}
      </div>

      <div className="pcaTabs">
        {[
          ["live", "Live Monitoring", Gauge],
          ["alerts", "Alert Log", Bell],
          ["rules", "Thresholds", SlidersHorizontal],
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

      {tab === "live" && (
        <div className="pcaLiveGrid">
          <section className="panel pcaLivePanel">
            <div className="pcaPanelHeader">
              <div>
                <h2>Real-Time Crowd Status</h2>
                <p>
                  Live crowd condition based on visitor count and Main Gate entry
                  flow.
                </p>
              </div>

              <span
                className={`aiBadge ${
                  crowdLevel === "Emergency"
                    ? "danger"
                    : crowdLevel === "Moderate"
                    ? "warn"
                    : "good"
                }`}
              >
                <div className="aiBadgeDot" />
                {crowdLevel}
              </span>
            </div>

            <div className="pcaCrowdMeterCard">
              <div className="pcaCrowdNumber">
                <strong>{currentVisitors}</strong>
                <span>visitors inside park</span>
              </div>

              <div className="pcaCrowdMeter">
                <div style={{ width: `${crowdPercentage}%` }} />
              </div>

              <div className="pcaThresholdLabels">
                <span>Warning: {warningThreshold}</span>
                <span>Emergency: {emergencyThreshold}</span>
              </div>
            </div>

            <div className="pcaLiveStatsGrid">
              <div>
                <span>Main Gate entry rate</span>
                <strong>{entryRate}</strong>
                <p>visitors / 15 minutes</p>
              </div>

              <div>
                <span>Warning threshold</span>
                <strong>{warningThreshold}</strong>
                <p>visitor count limit</p>
              </div>

              <div>
                <span>Emergency threshold</span>
                <strong>{emergencyThreshold}</strong>
                <p>critical visitor count</p>
              </div>
            </div>
          </section>

          <section className="panel pcaStatusPanel">
            <div className="pcaPanelHeader">
              <div>
                <h2>Alert Summary</h2>
                <p>Current alert status by severity.</p>
              </div>
            </div>

            <div className="pcaSeverityStack">
              <div className="pcaSeverityCard pcaHigh">
                <ShieldAlert size={20} />
                <div>
                  <span>High severity</span>
                  <strong>{highAlerts.length}</strong>
                </div>
              </div>

              <div className="pcaSeverityCard pcaMedium">
                <AlertTriangle size={20} />
                <div>
                  <span>Medium severity</span>
                  <strong>
                    {alerts.filter((item) => item.severity === "Medium").length}
                  </strong>
                </div>
              </div>

              <div className="pcaSeverityCard pcaLow">
                <CheckCircle2 size={20} />
                <div>
                  <span>Low severity</span>
                  <strong>
                    {alerts.filter((item) => item.severity === "Low").length}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {tab === "alerts" && (
        <section className="panel pcaAlertPanel">
          <div className="pcaPanelHeader pcaAlertHeader">
            <div>
              <h2>Alert Log</h2>
              <p>Click an alert to expand details and staff actions.</p>
            </div>

            <button className="ghostButton">
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="pcaToolbar">
            <div className="pcaSearchBar">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search alert, Main Gate, severity, or status..."
              />
            </div>

            <label className="pcaSortControl">
              Sort
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              >
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>

          <div className="pcaAlertCompactList">
            {sortedAlerts.map((alert) => {
              const isOpen = expandedAlertId === alert.alert_id;
              const progress = getAlertProgress(alert);

              return (
                <article
                  key={alert.alert_id}
                  className={`pcaAlertAccordion ${getSeverityClass(
                    alert.severity
                  )} ${isOpen ? "isOpen" : ""}`}
                >
                  <button
                    className="pcaAlertSummaryButton"
                    onClick={() =>
                      setExpandedAlertId(isOpen ? null : alert.alert_id)
                    }
                  >
                    <div className="pcaAlertSummaryLeft">
                      <div className="pcaAlertIcon">
                        {alert.severity === "High" ? (
                          <ShieldAlert size={20} />
                        ) : alert.severity === "Medium" ? (
                          <AlertTriangle size={20} />
                        ) : (
                          <Bell size={20} />
                        )}
                      </div>

                      <div>
                        <strong>{alert.alert_type}</strong>
                        <span>
                          {alert.location} · {formatDateTime(alert.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="pcaAlertSummaryRight">
                      <span
                        className={`aiBadge ${getSeverityBadge(
                          alert.severity
                        )}`}
                      >
                        <div className="aiBadgeDot" />
                        {alert.severity}
                      </span>

                      <span className={`aiBadge ${getStatusBadge(alert.status)}`}>
                        <div className="aiBadgeDot" />
                        {alert.status}
                      </span>

                      <ChevronDown size={17} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pcaAlertDetailBody">
                      <p className="pcaAlertMessage">{alert.message}</p>

                      <div className="pcaAlertProgressBlock">
                        <div className="pcaProgressHeader">
                          <span>Threshold usage</span>
                          <strong>{progress}%</strong>
                        </div>

                        <div className="pcaProgressTrack">
                          <div
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="pcaAlertMetaGrid advanced">
                        <div>
                          <span>Alert ID</span>
                          <strong>{alert.alert_id}</strong>
                        </div>

                        <div>
                          <span>Current count</span>
                          <strong>{alert.current_count}</strong>
                        </div>

                        <div>
                          <span>Threshold</span>
                          <strong>{alert.threshold}</strong>
                        </div>

                        <div>
                          <span>Acknowledged by</span>
                          <strong>{alert.acknowledged_by || "Not yet"}</strong>
                        </div>
                      </div>

                      {alert.action_taken ? (
                        <div className="pcaActionTaken">
                          <CheckCircle2 size={15} />
                          <span>{alert.action_taken}</span>
                        </div>
                      ) : (
                        <div className="pcaPendingAction">
                          <Clock size={15} />
                          <span>Waiting for staff acknowledgement.</span>
                        </div>
                      )}

                      {alert.status === "Active" && (
                        <button
                          className="primaryButton pcaAcknowledgeButton"
                          onClick={() => acknowledgeAlert(alert.alert_id)}
                        >
                          Acknowledge Alert
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "rules" && (
        <section className="panel pcaRulesPanel">
          <div className="pcaPanelHeader">
            <div>
              <h2>Threshold Rules</h2>
              <p>
                Staff can edit active monitoring thresholds for visitor count and
                Main Gate entry flow.
              </p>
            </div>
          </div>

          <div className="pcaRulesAdvancedGrid">
            {rules.map((rule) => {
              const isEditing = editingRuleId === rule.rule_id;
              const draft = isEditing ? ruleDraft : rule;

              return (
                <article
                  key={rule.rule_id}
                  className={`pcaRuleAdvancedCard ${getSeverityClass(
                    draft.severity
                  )}`}
                >
                  <div className="pcaRuleTop">
                    <div>
                      <strong>{rule.rule_name}</strong>
                      <span>{rule.rule_id}</span>
                    </div>

                    <span
                      className={`aiBadge ${getSeverityBadge(draft.severity)}`}
                    >
                      <div className="aiBadgeDot" />
                      {draft.severity}
                    </span>
                  </div>

                  {!isEditing ? (
                    <>
                      <div className="pcaRuleValueHero">
                        <span>Threshold</span>
                        <strong>{rule.threshold}</strong>
                        <p>{rule.metric}</p>
                      </div>

                      <div className="pcaRuleInfo advanced">
                        <div>
                          <span>Location</span>
                          <strong>{rule.location}</strong>
                        </div>

                        <div>
                          <span>Status</span>
                          <strong>{rule.status}</strong>
                        </div>
                      </div>

                      <button
                        className="ghostButton pcaRuleEditButton"
                        onClick={() => startEditRule(rule)}
                      >
                        <Edit3 size={15} />
                        Edit Rule
                      </button>
                    </>
                  ) : (
                    <div className="pcaRuleEditForm">
                      <label>
                        Rule name
                        <input
                          value={draft.rule_name}
                          onChange={(event) =>
                            updateRuleDraft("rule_name", event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Location
                        <input
                          value={draft.location}
                          onChange={(event) =>
                            updateRuleDraft("location", event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Metric
                        <input
                          value={draft.metric}
                          onChange={(event) =>
                            updateRuleDraft("metric", event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Threshold
                        <input
                          type="number"
                          min="0"
                          value={draft.threshold}
                          onChange={(event) =>
                            updateRuleDraft("threshold", event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Severity
                        <select
                          value={draft.severity}
                          onChange={(event) =>
                            updateRuleDraft("severity", event.target.value)
                          }
                        >
                          {SEVERITY_OPTIONS.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Status
                        <select
                          value={draft.status}
                          onChange={(event) =>
                            updateRuleDraft("status", event.target.value)
                          }
                        >
                          {STATUS_OPTIONS.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </label>

                      <div className="pcaRuleEditActions">
                        <button className="ghostButton" onClick={cancelEditRule}>
                          <XCircle size={15} />
                          Cancel
                        </button>

                        <button className="primaryButton" onClick={saveRule}>
                          <Save size={15} />
                          Save Rule
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
