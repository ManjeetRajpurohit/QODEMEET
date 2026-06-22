import React from "react";

const VideoSection = ({
  localVideoRef,
  remoteVideoRef,
  isScreenSharing,
}) => {
  if (isScreenSharing) {
    return (
      <div className="relative w-full h-full min-h-[600px] bg-black">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          controls={false}
          className="w-full h-full object-contain"
        />

        <div className="absolute bottom-5 right-5 w-64 h-40 rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black z-10">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            controls={false}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="h-44 p-3">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          controls={false}
          className="w-full h-full rounded-xl bg-black object-cover"
        />
      </div>

      <div className="h-44 p-3 pt-0">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          controls={false}
          className="w-full h-full rounded-xl bg-black object-cover"
        />
      </div>
    </div>
  );
};

export default VideoSection;