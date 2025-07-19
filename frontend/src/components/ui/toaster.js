import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = ({
    title,
    status = "info",
    duration = 3000,
    position = "bottom",
    isClosable = false,
  }) => {
    setToast({ title, status, position, isClosable });

    if (!isClosable) {
      setTimeout(() => setToast(null), duration);
    }
  };

  const closeToast = () => setToast(null);

  const getPositionStyles = (position) => {
    switch (position) {
      case "top-left":
        return { top: "20px", left: "20px" };
      case "top":
        return { top: "20px", left: "50%", transform: "translateX(-50%)" };
      case "top-right":
        return { top: "20px", right: "20px" };
      case "bottom-left":
        return { bottom: "20px", left: "20px" };
      case "bottom-right":
        return { bottom: "20px", right: "20px" };
      default:
        return { bottom: "20px", left: "50%", transform: "translateX(-50%)" };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          style={{
            position: "fixed",
            ...getPositionStyles(toast.position),
            padding: "10px 20px",
            backgroundColor:
              toast.status === "success"
                ? "#38a169"
                : toast.status === "error"
                ? "#e53e3e"
                : toast.status === "warning"
                ? "#dd6b20"
                : "#3182ce",
            color: "white",
            borderRadius: "6px",
            zIndex: 9999,
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
            fontSize: "14px",
            fontFamily: "sans-serif",
            minWidth: "200px",
            textAlign: "center",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ flex: 1 }}>{toast.title}</span>
          {toast.isClosable && (
            <button
              onClick={closeToast}
              style={{
                background: "transparent",
                color: "white",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              &times;
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
