import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(false)
  
  return (
    <div className="border w-full h-screen sm:px-[5%] sm:py-[2%]">
      <div className={`bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid relative ${
        selectedUser ? 'grid-cols-[300px_1fr_300px]' : 'grid-cols-2'
      }`}> 
        <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        <ChatContainer selectedUser={selectedUser} />
        {selectedUser && <RightSidebar />}
      </div>
    </div>
  );
};

export default HomePage;
