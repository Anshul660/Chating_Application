import "@fortawesome/fontawesome-free/css/all.min.css";

import { Routes, Route } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage";
import Chatspage from "./pages/Chatspage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chats" element={<Chatspage />} />
      </Routes>
    </div>
  );
}

export default App;
