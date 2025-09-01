import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { useChat } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 h-full flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed lg:relative z-50 lg:z-auto
          w-80 sm:w-96 lg:w-80 xl:w-96
          h-full transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatContainer
            setSidebarOpen={setSidebarOpen}
            setRightSidebarOpen={setRightSidebarOpen}
            rightSidebarOpen={rightSidebarOpen}
          />
        </div>

        {/* Right Sidebar - Hidden on mobile/tablet, visible on desktop when user selected */}
        {selectedUser && (
          <>
            {/* Mobile Right Sidebar Overlay */}
            {rightSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 xl:hidden"
                onClick={() => setRightSidebarOpen(false)}
              />
            )}

            {/* Right Sidebar */}
            <div
              className={`
              fixed xl:relative z-50 xl:z-auto right-0
              w-80 sm:w-96 xl:w-80
              h-full transform transition-transform duration-300 ease-in-out
              ${
                rightSidebarOpen
                  ? "translate-x-0"
                  : "translate-x-full xl:translate-x-0"
              }
            `}
            >
              <RightSidebar
                rightSidebarOpen={rightSidebarOpen}
                setRightSidebarOpen={setRightSidebarOpen}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
