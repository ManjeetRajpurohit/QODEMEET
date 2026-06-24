import React from "react";
import VideoSection from "./VideoSection";
import CodeEditor from "./CodeEditor";
import ChatPanel from "./ChatPanel";

const PresentationView = ({
  localVideoRef,
  remoteVideoRef,
  isScreenSharing,

  code,
  setCode,
  language,
  setLanguage,
  role,
  socket,
  roomId,
  setOutput,

  messages,
  user,
  inputMessage,
  setInputMessage,
  handleSendMessage,
}) => {
  return (
    <div className="h-full flex flex-col bg-[#020617] transition-all duration-300 ease-in-out">
      {/* Presentation Area */}
      <div className="flex-1 min-h-0 relative border-b border-white/10 bg-black overflow-hidden">
        <VideoSection
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isScreenSharing={isScreenSharing}
        />
      </div>

      {/* Editor + Chat */}
      <div className="h-[40%] grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <div className="border-r border-white/10 min-h-0">
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            role={role}
            socket={socket}
            roomId={roomId}
            setOutput={setOutput}
          />
        </div>

        <div className="min-h-0">
          <ChatPanel
            messages={messages}
            user={user}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default PresentationView;
