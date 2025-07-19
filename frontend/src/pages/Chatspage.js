import ChatBox from "../components/miscellaneous/ChatBox";
import MyChats from "../components/miscellaneous/MyChats";
import SideDreawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import "../components/miscellaneous/SideDrawer.css";
// import "./ChatPage.css";
import { useState } from "react";

const Chatspage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div className="container">
      {user && <SideDreawer />}

      <div className="mychat">
        <div className="mychat_chatbox">
          {user && <MyChats className="mychat" fetchAgain={fetchAgain} />}
          {user && (
            <ChatBox
              className="chatbox"
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatspage;
