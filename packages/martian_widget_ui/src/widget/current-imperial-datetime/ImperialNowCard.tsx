import type { CurrentImperialDatetimeDisplayModel } from "./model";

type Props = {
  model: CurrentImperialDatetimeDisplayModel;
};

export default function ImperialNowCard({ model }: Props) {
  return (
    <section
      style={{
        border: "1px solid rgba(15, 23, 42, 0.14)",
        borderRadius: "24px",
        background: "linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(236, 240, 244, 0.96) 100%)",
        padding: "20px",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div style={{ display: "grid", gap: "10px" }}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "12px", letterSpacing: "0.12em", color: "#475569" }}>CURRENT IMPERIAL DATETIME</div>
            <div
              style={{
                borderRadius: "999px",
                background:
                  model.status === "error"
                    ? "rgba(239, 68, 68, 0.12)"
                    : model.status === "loading"
                      ? "rgba(245, 158, 11, 0.14)"
                      : "rgba(16, 185, 129, 0.12)",
                color: model.status === "error" ? "#b91c1c" : model.status === "loading" ? "#b45309" : "#047857",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {model.status === "loading"
                ? "LOADING"
                : model.status === "error"
                  ? "ERROR"
                  : model.status === "success"
                    ? "SUCCESS"
                    : "IDLE"}
            </div>
          </div>
          <div style={{ fontSize: "32px", lineHeight: 1.1, fontWeight: 700, color: "#0f172a", marginTop: "6px" }}>
            {model.imperialDateLine}
          </div>
          {model.imperialTimeLine !== undefined ? (
            <div style={{ fontSize: "18px", color: "#1e293b", marginTop: "6px" }}>{model.imperialTimeLine}</div>
          ) : null}
          {model.timezoneLine !== undefined ? (
            <div style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}>{model.timezoneLine}</div>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: "4px" }}>
          {model.gregorianLine !== undefined ? (
            <div style={{ fontSize: "13px", color: "#475569" }}>{model.gregorianLine}</div>
          ) : null}
          {model.relativeFetchedAt !== undefined ? (
            <div style={{ fontSize: "13px", color: "#64748b" }}>{model.relativeFetchedAt}</div>
          ) : null}
        </div>

        {model.errorMessage !== undefined ? (
          <div
            style={{
              borderRadius: "14px",
              background: "rgba(239, 68, 68, 0.08)",
              color: "#b91c1c",
              padding: "12px 14px",
              fontSize: "14px",
            }}
          >
            {model.errorMessage}
          </div>
        ) : null}
      </div>
    </section>
  );
}
