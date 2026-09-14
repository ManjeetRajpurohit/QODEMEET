import React, { useEffect } from "react";
import { Video, Monitor } from "lucide-react";
const VideoSection = ({
  localVideoRef,
  remoteVideoRef,
  isScreenSharing,
}) => {
  useEffect(() => {
    const attachVideos = async () => {
      try {
        if (localVideoRef?.current) {
          localVideoRef.current.muted = true;
          await localVideoRef.current.play().catch(() => {});
        }
        if (remoteVideoRef?.current) {
          if (
    remoteVideoRef.current?.srcObject
) {
    remoteVideoRef.current
        .play()
        .catch(()=>{});
}
        }
      } catch (error) {
        console.error(
          "Video playback error:",
          error
        );
      }
    };
    const timer = requestAnimationFrame(
    attachVideos
);
    return () => {
      cancelAnimationFrame(timer);
    };
  }, [
    localVideoRef,
    remoteVideoRef,
    isScreenSharing,
  ]);
  return (
    <div className="h-full w-full relative bg-[#020617] p-1.5 sm:p-3">
      {/* Remote video fills the whole container - works at any height,
          from the 96px mobile strip up to the 320px desktop column */}
      <div className="absolute inset-1.5 sm:inset-3 rounded-lg sm:rounded-2xl overflow-hidden border border-white/10 bg-[#0B1220]">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs text-white">
          <Video size={12} className="hidden sm:block" />
          <span className="hidden sm:inline">Remote Participant</span>
          <span className="sm:hidden">Remote</span>
        </div>
        <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-xs text-white">
          Live
        </div>
      </div>

      {/* Local video - small PIP thumbnail, scales with the container
          instead of a fixed height, so it never overflows a short strip */}
      <div className="absolute bottom-2.5 right-2.5 sm:bottom-5 sm:right-5 w-1/3 max-w-[64px] sm:max-w-[140px] aspect-video rounded-md sm:rounded-xl overflow-hidden border border-white/20 shadow-lg bg-[#0B1220]">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0.5 left-0.5 sm:top-2 sm:left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1 py-0.5 sm:px-2 sm:py-1 rounded-full text-white">
          {isScreenSharing ? (
            <Monitor size={9} className="sm:hidden" />
          ) : (
            <Video size={9} className="sm:hidden" />
          )}
          {isScreenSharing ? (
            <Monitor size={12} className="hidden sm:block" />
          ) : (
            <Video size={12} className="hidden sm:block" />
          )}
        </div>
      </div>
    </div>
  );
};
export default VideoSection;
