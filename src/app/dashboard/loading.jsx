import "@/styles/loading.css";

export default function Loader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid #ccc",
          borderTop: "4px solid #4a90e2",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
       @keyframes spin {
         0% { transform: rotate(0deg); }
         100% { transform: rotate(360deg); }
       }
     `}</style>
    </div>
  );
}
