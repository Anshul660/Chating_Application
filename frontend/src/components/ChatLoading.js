import React from "react";

const ChatLoading = () => {
  const skeletons = Array.from({ length: 6 });

  return (
    <div style={{ padding: "10px" }}>
      <style>{`
        .chat-skeleton {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 12px;
          background-color: #f6f7f8;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .skeleton-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite linear;
        }

        .skeleton-info {
          flex: 1;
          margin-left: 15px;
        }

        .skeleton-line {
          height: 10px;
          border-radius: 6px;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite linear;
          margin-bottom: 6px;
        }

        .skeleton-line.short {
          width: 40%;
        }

        .skeleton-line.long {
          width: 80%;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {skeletons.map((_, i) => (
        <div className="chat-skeleton" key={i}>
          <div className="skeleton-avatar" />
          <div className="skeleton-info">
            <div className="skeleton-line long" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatLoading;
