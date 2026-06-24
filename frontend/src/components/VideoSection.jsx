import React from "react";
import {
  Video,
  VideoOff,
  Monitor,
} from "lucide-react";

const VideoSection = ({
  localVideoRef,
  remoteVideoRef,
  isScreenSharing,
}) => {
  return (
    <div className="h-full flex flex-col gap-3 p-3 bg-[#020617]">
      {/* Remote Participant */}
      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/10 bg-[#0B1220] relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
          <Video size={12} />
          Remote Participant
        </div>

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
          Live
        </div>
      </div>

      {/* Local Participant */}
      <div className="h-44 rounded-2xl overflow-hidden border border-white/10 bg-[#0B1220] relative flex-shrink-0">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white">
          {isScreenSharing ? (
            <>
              <Monitor size={12} />
              Sharing Screen
            </>
          ) : (
            <>
              <VideoOff size={12} />
              You
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
