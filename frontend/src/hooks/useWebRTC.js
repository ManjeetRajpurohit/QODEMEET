import { useEffect, useRef, useState } from "react";

export default function useWebRTC(socket, roomId) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteScreenSharing, setRemoteScreenSharing] = useState(false);

  useEffect(() => {
    if (!socket || !roomId) return;

    initializeCall();

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("interview-ended");
      socket.off("screen-share-started");
      socket.off("screen-share-stopped");

      peerRef.current?.close();

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [socket, roomId]);

  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
            ],
          },
          {
            urls: "stun:stun.relay.metered.ca:80",
          },
          {
            urls: "turn:global.relay.metered.ca:80",
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          },
          {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          },
          {
            urls: "turn:global.relay.metered.ca:443",
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          },
          {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          },
        ],
      });

      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams?.[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];

          setRemoteConnected(true);

          remoteVideoRef.current.play().catch(() => {});
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      peer.onconnectionstatechange = () => {
        console.log("Connection State:", peer.connectionState);

        if (
          peer.connectionState === "disconnected" ||
          peer.connectionState === "failed" ||
          peer.connectionState === "closed"
        ) {
          setRemoteConnected(false);
        }

        if (peer.connectionState === "connected") {
          setRemoteConnected(true);
        }
      };

      peer.oniceconnectionstatechange = () => {
        console.log("ICE State:", peer.iceConnectionState);
      };

      socket.emit("join-room", roomId);

      socket.on("screen-share-started", () => {
        setRemoteScreenSharing(true);
      });

      socket.on("screen-share-stopped", () => {
        setRemoteScreenSharing(false);
      });

      socket.on("offer", async (offer) => {
        try {
          if (peer.signalingState !== "stable") return;

          await peer.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          while (pendingCandidatesRef.current.length > 0) {
            const candidate = pendingCandidatesRef.current.shift();

            await peer.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }

          const answer = await peer.createAnswer();

          await peer.setLocalDescription(answer);

          socket.emit("answer", {
            roomId,
            answer: peer.localDescription,
          });
        } catch (error) {
          console.error("Offer Error:", error);
        }
      });

      socket.on("answer", async (answer) => {
        try {
          if (peer.signalingState !== "have-local-offer") return;

          await peer.setRemoteDescription(
            new RTCSessionDescription(answer)
          );

          while (pendingCandidatesRef.current.length > 0) {
            const candidate = pendingCandidatesRef.current.shift();

            await peer.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          }
        } catch (error) {
          console.error("Answer Error:", error);
        }
      });

      socket.on("ice-candidate", async (candidate) => {
        try {
          if (peer.remoteDescription) {
            await peer.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } else {
            pendingCandidatesRef.current.push(candidate);
          }
        } catch (error) {
          console.error("ICE Candidate Error:", error);
        }
      });

      socket.on("user-joined", async () => {
        try {
          const offer = await peer.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });

          await peer.setLocalDescription(offer);

          socket.emit("offer", {
            roomId,
            offer: peer.localDescription,
          });
        } catch (error) {
          console.error("Create Offer Error:", error);
        }
      });

      socket.on("user-left", () => {
        setRemoteConnected(false);
        setRemoteScreenSharing(false);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      socket.on("interview-ended", () => {
        localStreamRef.current?.getTracks().forEach((track) =>
          track.stop()
        );

        peerRef.current?.close();
      });
    } catch (error) {
      console.error("WebRTC initialization failed:", error);
    }
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;
    setCameraEnabled(track.enabled);
  };

  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      const sender = peerRef.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");

      if (!sender) return;

      setIsScreenSharing(true);

      socket.emit("screen-share-started", roomId);

      await sender.replaceTrack(screenTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      screenTrack.onended = async () => {
        try {
          const cameraTrack =
            localStreamRef.current?.getVideoTracks()[0];

          socket.emit("screen-share-stopped", roomId);

          if (cameraTrack) {
            await sender.replaceTrack(cameraTrack);
          }

          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject =
              localStreamRef.current;
          }

          setIsScreenSharing(false);
        } catch (error) {
          console.error("Restore Camera Error:", error);
        }
      };
    } catch (error) {
      console.error("Screen Share Error:", error);
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach((track) =>
      track.stop()
    );

    peerRef.current?.close();

    socket.emit("leave-room", roomId);
  };

  return {
    localVideoRef,
    remoteVideoRef,
    toggleMic,
    toggleCamera,
    shareScreen,
    endCall,
    micEnabled,
    cameraEnabled,
    remoteConnected,
    isScreenSharing,
    remoteScreenSharing,
  };
}