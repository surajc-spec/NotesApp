import React, { useEffect, useState } from "react";

function DesktopOnly({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () =>
      window.removeEventListener("resize", checkDevice);
  }, []);

  if (isMobile) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          background: "#000",
          color: "#fff",
          textAlign: "center",
          padding: "20px",
        }}
      >
        <h1>🖥 Open on Laptop / PC</h1>

        <p>
          This website is currently available only for desktop users.
        </p>
      </div>
    );
  }

  return children;
}

export default DesktopOnly;