/**
 * PageHeader — header konsisten untuk setiap halaman admin
 * Props: title, subtitle, action (button/JSX opsional)
 */
const PageHeader = ({ title, subtitle, action }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    }}
  >
    <div>
      <h1
        style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700, fontSize: 26,
          letterSpacing: "0.04em", textTransform: "uppercase",
          color: "#CDD5E4", marginBottom: 4,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "#4E5D75" }}>
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default PageHeader;