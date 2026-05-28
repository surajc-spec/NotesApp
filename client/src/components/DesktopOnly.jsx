import React from "react";
import { Capacitor } from "@capacitor/core";

function DesktopOnly({ children }) {

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i
      .test(navigator.userAgent);

  const isNativeApp = Capacitor.isNativePlatform();

  if (isMobile && !isNativeApp) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>

          <h1
            style={{
              fontSize: "36px",
              marginBottom: "20px",
            }}
          >
            🖥 Open on Laptop / PC
          </h1>

          <p
            style={{
              color: "#aaa",
              fontSize: "18px",
            }}
          >
            NoteShare is available only on desktop devices.
          </p>

        </div>
      </div>
    );
  }

  return children;
}

export default DesktopOnly;
