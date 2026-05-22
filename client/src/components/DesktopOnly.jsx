import React, { useEffect, useState } from "react";

function DesktopOnly({ children }) {
  const [allowAccess, setAllowAccess] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;

      const isMobileDevice =
        /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
          ua
        );

      const isDesktopMode =
        window.innerWidth >= 1000;

      // Block only mobile in normal mode
      if (isMobileDevice && !isDesktopMode) {
        setAllowAccess(false);
      } else {
        setAllowAccess(true);
      }
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  if (!allowAccess) {
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
        <div
          style={{
            maxWidth: "500px",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              marginBottom: "20px",
            }}
          >
            🖥 Open on Laptop / PC
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#aaa",
            }}
          >
            NoteShare is currently optimized for desktop experience.
          </p>

          <p
            style={{
              marginTop: "20px",
              color: "#00ffb7",
            }}
          >
            Or enable <b>Desktop Site</b> in your browser.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default DesktopOnly;