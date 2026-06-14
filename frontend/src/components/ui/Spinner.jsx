/**
 * Spinner — loading indicator reusable
 * Dipakai di seluruh halaman sebagai fallback loading state
 */
const Spinner = ({ size = 32, color = "#C8912A" }) => (
  <div
    style={{
      width: size,
      height: size,
      border: `2px solid rgba(200,145,42,0.15)`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spinSlow 0.8s linear infinite",
      flexShrink: 0,
    }}
  />
);

export default Spinner;