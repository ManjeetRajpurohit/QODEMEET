import React from "react";
import {
  Monitor,
  Video,
} from "lucide-react";

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
    <div className="h-full flex flex-col bg-[#020617] overflow-hidden animate-in fade-in duration-300">
      {/* Presentation Area */}
      <div className="flex-1 min-h-0 relative bg-black border-b border-white/10 overflow-hidden">
        {/* Shared Screen / Main Video */}
        <video
          ref={
            isScreenSharing
              ? localVideoRef
              : remoteVideoRef
          }
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Presentation Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm">
          <Monitor size={16} />
          Presentation Mode
        </div>

        {/* Floating Video */}
        <div className="absolute bottom-4 right-4 w-56 h-36 md:w-64 md:h-40 rounded-2xl overflow-hidden border border-white/20 bg-[#0B1220] shadow-2xl z-20">
          <video
            ref={
              isScreenSharing
                ? remoteVideoRef
                : localVideoRef
            }
            autoPlay
            muted={!isScreenSharing}
            playsInline
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
            <Video size={12} />
            {isScreenSharing
              ? "Participant"
              : "You"}
          </div>
        </div>
      </div>

      {/* Bottom Workspace */}
      <div className="h-[42%] min-h-[280px] grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Code Editor */}
        <div className="border-r border-white/10 min-h-0 overflow-hidden">
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

        {/* Chat */}
        <div className="min-h-0 overflow-hidden">
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
