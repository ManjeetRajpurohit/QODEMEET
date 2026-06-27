import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
} from "lucide-react";
const BottomControls = ({
  toggleMic,
  toggleCamera,
  shareScreen,
  stopScreenShare,
  endCall,
  micEnabled,
  cameraEnabled,
  isScreenSharing = false,
  userRole,
}) => {
  return (
    <div className="border-t border-white/10 bg-[#020617] px-3 py-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
            micEnabled
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {micEnabled ? (
            <Mic size={18} />
          ) : (
            <MicOff size={18} />
          )}
        </button>
        <button
          onClick={toggleCamera}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
            cameraEnabled
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {cameraEnabled ? (
            <Video size={18} />
          ) : (
            <VideoOff size={18} />
          )}
        </button>
        <button
          onClick={
            isScreenSharing
              ? stopScreenShare
              : shareScreen
          }
          className={`px-5 h-12 rounded-full border flex items-center gap-2 transition-all duration-200 ${
            isScreenSharing
              ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
              : "bg-[#0B1220] border-white/10 text-white hover:bg-[#141d31]"
          }`}
        >
          <MonitorUp size={18} />
          {isScreenSharing
            ? "Stop Sharing"
            : "Share Screen"}
        </button>
        <button
          onClick={endCall}
          className="px-6 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 transition-all duration-200"
        >
          <PhoneOff size={18} />
          {userRole === "interviewer"
            ? "End Interview"
            : "Leave Interview"}
        </button>
      </div>
    </div>
  );
};
export default BottomControls;

