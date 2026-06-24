import { useEffect, useRef, useState } from "react";

export default function useWebRTC(socket, roomId) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const initializedRef = useRef(false);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteScreenSharing, setRemoteScreenSharing] =
    useState(false);

  useEffect(() => {
    if (!socket || !roomId) return;

    if (initializedRef.current) return;

    initializedRef.current = true;

    initializeCall();

    return () => {
      initializedRef.current = false;

      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("interview-ended");
      socket.off("screen-share-started");
      socket.off("screen-share-stopped");

      if (peerRef.current) {
        peerRef.current.ontrack = null;
        peerRef.current.onicecandidate = null;
        peerRef.current.onconnectionstatechange = null;
        peerRef.current.oniceconnectionstatechange = null;

        peerRef.current.close();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        localStreamRef.current = null;
      }
    };
  }, [socket, roomId]);

  const createPeerConnection = () => {
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
          username:
            import.meta.env.VITE_TURN_USERNAME,
          credential:
            import.meta.env.VITE_TURN_CREDENTIAL,
        },
        {
          urls:
            "turn:global.relay.metered.ca:80?transport=tcp",
          username:
            import.meta.env.VITE_TURN_USERNAME,
          credential:
            import.meta.env.VITE_TURN_CREDENTIAL,
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username:
            import.meta.env.VITE_TURN_USERNAME,
          credential:
            import.meta.env.VITE_TURN_CREDENTIAL,
        },
        {
          urls:
            "turns:global.relay.metered.ca:443?transport=tcp",
          username:
            import.meta.env.VITE_TURN_USERNAME,
          credential:
            import.meta.env.VITE_TURN_CREDENTIAL,
        },
      ],
    });

    peer.ontrack = (event) => {
      if (!event.streams?.[0]) return;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          event.streams[0];

        remoteVideoRef.current
          .play()
          .catch(() => {});
      }

      setRemoteConnected(true);
    };

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      socket.emit("ice-candidate", {
        roomId,
        candidate: event.candidate,
      });
    };

    peer.onconnectionstatechange = () => {
      console.log(
        "Connection State:",
        peer.connectionState
      );

      switch (peer.connectionState) {
        case "connected":
          setRemoteConnected(true);
          break;

        case "failed":
        case "closed":
        case "disconnected":
          setRemoteConnected(false);
          break;

        default:
          break;
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log(
        "ICE State:",
        peer.iceConnectionState
      );
    };

    return peer;
  };

  const initializeCall = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          stream;

        localVideoRef.current
          .play()
          .catch(() => {});
      }

      const peer = createPeerConnection();

      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      socket.emit("join-room", roomId);

      socket.on(
        "screen-share-started",
        () => {
          setRemoteScreenSharing(true);
        }
      );

      socket.on(
        "screen-share-stopped",
        () => {
          setRemoteScreenSharing(false);
        }
      );

      socket.on(
        "offer",
        async (offer) => {
          try {
            if (
              peer.signalingState ===
              "have-local-offer"
            ) {
              return;
            }

            await peer.setRemoteDescription(
              new RTCSessionDescription(
                offer
              )
            );

            while (
              pendingCandidatesRef.current
                .length > 0
            ) {
              const candidate =
                pendingCandidatesRef.current.shift();

              await peer.addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );
            }

            const answer =
              await peer.createAnswer();

            await peer.setLocalDescription(
              answer
            );

            socket.emit("answer", {
              roomId,
              answer:
                peer.localDescription,
            });
          } catch (error) {
            console.error(
              "Offer Error:",
              error
            );
          }
        }
      );

      socket.on(
        "answer",
        async (answer) => {
          try {
            if (
              peer.signalingState !==
              "have-local-offer"
            ) {
              return;
            }

            await peer.setRemoteDescription(
              new RTCSessionDescription(
                answer
              )
            );

            while (
              pendingCandidatesRef.current
                .length > 0
            ) {
              const candidate =
                pendingCandidatesRef.current.shift();

              await peer.addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );
            }
          } catch (error) {
            console.error(
              "Answer Error:",
              error
            );
          }
        }
      );

      socket.on(
        "ice-candidate",
        async (candidate) => {
          try {
            if (
              peer.remoteDescription
            ) {
              await peer.addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );
            } else {
              pendingCandidatesRef.current.push(
                candidate
              );
            }
          } catch (error) {
            console.error(
              "ICE Candidate Error:",
              error
            );
          }
        }
      );

      socket.on(
        "user-joined",
        async () => {
          try {
            if (
              peer.signalingState !==
              "stable"
            ) {
              return;
            }

            const offer =
              await peer.createOffer();

            await peer.setLocalDescription(
              offer
            );

            socket.emit("offer", {
              roomId,
              offer:
                peer.localDescription,
            });
          } catch (error) {
            console.error(
              "Create Offer Error:",
              error
            );
          }
        }
      );

      socket.on(
        "user-left",
        () => {
          setRemoteConnected(false);
          setRemoteScreenSharing(false);

          if (
            remoteVideoRef.current
          ) {
            remoteVideoRef.current.srcObject =
              null;
          }
        }
      );

      socket.on(
        "interview-ended",
        () => {
          endCall();
        }
      );
    } catch (error) {
      console.error(
        "WebRTC initialization failed:",
        error
      );
    }
  };

  const toggleMic = () => {
    const track =
      localStreamRef.current?.getAudioTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setMicEnabled(track.enabled);
  };

  const toggleCamera = () => {
    const track =
      localStreamRef.current?.getVideoTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setCameraEnabled(track.enabled);
  };

  const shareScreen = async () => {
    try {
      if (isScreenSharing) return;

      const screenStream =
        await navigator.mediaDevices.getDisplayMedia(
          {
            video: true,
          }
        );

      const screenTrack =
        screenStream.getVideoTracks()[0];

      const sender =
        peerRef.current
          ?.getSenders()
          .find(
            (s) =>
              s.track?.kind ===
              "video"
          );

      if (!sender) return;

      setIsScreenSharing(true);

      socket.emit(
        "screen-share-started",
        roomId
      );

      await sender.replaceTrack(
        screenTrack
      );

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          screenStream;
      }

      screenTrack.onended =
        async () => {
          try {
            const cameraTrack =
              localStreamRef.current?.getVideoTracks()[0];

            if (cameraTrack) {
              await sender.replaceTrack(
                cameraTrack
              );
            }

            if (
              localVideoRef.current &&
              localStreamRef.current
            ) {
              localVideoRef.current.srcObject =
                localStreamRef.current;
            }

            socket.emit(
              "screen-share-stopped",
              roomId
            );

            setIsScreenSharing(false);
          } catch (error) {
            console.error(
              "Restore Camera Error:",
              error
            );
          }
        };
    } catch (error) {
      console.error(
        "Screen Share Error:",
        error
      );

      setIsScreenSharing(false);
    }
  };

  const endCall = () => {
    try {
      socket.emit(
        "leave-room",
        roomId
      );

      if (
        localStreamRef.current
      ) {
        localStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      if (peerRef.current) {
        peerRef.current.close();
      }

      if (
        localVideoRef.current
      ) {
        localVideoRef.current.srcObject =
          null;
      }

      if (
        remoteVideoRef.current
      ) {
        remoteVideoRef.current.srcObject =
          null;
      }

      setRemoteConnected(false);
      setIsScreenSharing(false);
      setRemoteScreenSharing(false);
    } catch (error) {
      console.error(error);
    }
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
