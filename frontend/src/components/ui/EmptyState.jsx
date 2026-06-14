/**
 * EmptyState — tampilan kosong yang konsisten
 * Dipakai di semua tabel/list yang tidak punya data
 */
const EmptyState = ({ message = "Tidak ada data", icon = null }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "50px 0",
      gap: 12,
      color: "#2E3A50",
    }}
  >
    {icon ?? (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="#1A2035" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )}
    <span
      style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontSize: 16, fontWeight: 600,
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}
    >
      {message}
    </span>
  </div>
);

export default EmptyState;