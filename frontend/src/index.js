import ReactDOM from "react-dom/client";
import "@fortawesome/fontawesome-free/css/all.min.css";

import App from "./App";
import ChatProvider from "./Context/ChatProvider";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/ui/toaster";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ChatProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ChatProvider>
  </BrowserRouter>
);
