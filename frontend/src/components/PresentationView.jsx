import React from "react";
import { Monitor } from "lucide-react";
import CodeEditor from "./CodeEditor";
import ChatPanel from "./ChatPanel";

const PresentationView = ({
  localVideoRef,
  remoteVideoRef,
  isScreenSharing,
  remoteScreenSharing,
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
  // Whoever is sharing, their video element is the one carrying the
  // screen content (the hook swaps the actual track underneath it).
  const bigVideoRef = isScreenSharing
    ? localVideoRef
    : remoteVideoRef;

  const pipVideoRef = isScreenSharing
    ? remoteVideoRef
    : localVideoRef;

  const sharerLabel = isScreenSharing
    ? "Your screen"
    : "Remote screen";

  return (
    <div className="h-full flex overflow-hidden">
      {/* Presentation stage */}
      <div className="flex-1 min-w-0 relative bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={bigVideoRef}
          autoPlay
          playsInline
          muted={bigVideoRef === localVideoRef}
          className="w-full h-full object-contain bg-black"
        />

        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Monitor size={14} />
          {sharerLabel}
        </div>

        {/* PIP camera bubble - the other feed (camera, not screen) */}
        <div className="absolute bottom-4 right-4 w-44 h-28 rounded-xl overflow-hidden border border-white/20 shadow-lg bg-[#0B1220]">
          <video
            ref={pipVideoRef}
            autoPlay
            playsInline
            muted={pipVideoRef === localVideoRef}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Side panel: code + chat stay reachable while presenting */}
      <div className="w-[380px] flex-shrink-0 border-l border-white/10 flex flex-col overflow-hidden">
        <div className="h-1/2 min-h-0 border-b border-white/10">
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

        <div className="flex-1 min-h-0">
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
