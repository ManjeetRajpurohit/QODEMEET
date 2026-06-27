import { useEffect, useRef, useState } from "react";

export default function useWebRTC(socket, roomId) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  // Whichever stream SHOULD currently be shown locally
  // (camera normally, screen while sharing).
  const activeLocalStreamRef = useRef(null);

  // The remote MediaStream, kept here independently of any
  // particular <video> element so we can re-attach it whenever
  // the ref target changes (e.g. switching between normal layout
  // and presentation layout swaps which <video> tag holds
  // remoteVideoRef - the new tag doesn't inherit srcObject
  // automatically, so we have to reassign it).
  const remoteStreamRef = useRef(null);

  // Holds the current screen-capture track so the in-app
  // "Stop Sharing" button can stop it directly, not just rely on
  // the browser's native "Stop sharing" bar.
  const screenTrackRef = useRef(null);

  const pendingCandidatesRef = useRef([]);
  const initializedRef = useRef(false);

  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);

  const [micEnabled, setMicEnabled] =
    useState(true);

  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const [remoteConnected, setRemoteConnected] =
    useState(false);

  const [isScreenSharing, setIsScreenSharing] =
    useState(false);

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
        peerRef.current.close();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        localStreamRef.current = null;
      }
    };
  }, [socket, roomId]);

  // Self-healing attach loop. Runs continuously and re-attaches
  // whichever stream SHOULD be showing to whichever <video> element
  // the refs currently point to - covers screen-share swaps AND
  // layout swaps (normal <-> presentation) where the ref jumps to a
  // different DOM node.
  useEffect(() => {
    const attachStreams = () => {
      if (
        localVideoRef.current &&
        activeLocalStreamRef.current &&
        localVideoRef.current.srcObject !==
          activeLocalStreamRef.current
      ) {
        localVideoRef.current.srcObject =
          activeLocalStreamRef.current;

        localVideoRef.current.muted = true;

        localVideoRef.current
          .play()
          .catch(() => {});
      }

      if (
        remoteVideoRef.current &&
        remoteStreamRef.current &&
        remoteVideoRef.current.srcObject !==
          remoteStreamRef.current
      ) {
        remoteVideoRef.current.srcObject =
          remoteStreamRef.current;

        remoteVideoRef.current
          .play()
          .catch(() => {});
      }
    };

    const timer = setInterval(
      attachStreams,
      300
    );

    attachStreams();

    return () =>
      clearInterval(timer);
  }, []);

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
          urls:
            "stun:stun.relay.metered.ca:80",
        },
        {
          urls:
            "turn:global.relay.metered.ca:80",
          username:
            import.meta.env
              .VITE_TURN_USERNAME,
          credential:
            import.meta.env
              .VITE_TURN_CREDENTIAL,
        },
        {
          urls:
            "turn:global.relay.metered.ca:80?transport=tcp",
          username:
            import.meta.env
              .VITE_TURN_USERNAME,
          credential:
            import.meta.env
              .VITE_TURN_CREDENTIAL,
        },
        {
          urls:
            "turn:global.relay.metered.ca:443",
          username:
            import.meta.env
              .VITE_TURN_USERNAME,
          credential:
            import.meta.env
              .VITE_TURN_CREDENTIAL,
        },
        {
          urls:
            "turns:global.relay.metered.ca:443?transport=tcp",
          username:
            import.meta.env
              .VITE_TURN_USERNAME,
          credential:
            import.meta.env
              .VITE_TURN_CREDENTIAL,
        },
      ],
    });

    peer.ontrack = (event) => {
      const incomingStream = event.streams[0];

      remoteStreamRef.current = incomingStream;

      if (remoteVideoRef.current) {
        if (
          remoteVideoRef.current.srcObject !==
          incomingStream
        ) {
          remoteVideoRef.current.srcObject =
            incomingStream;
        }

        remoteVideoRef.current
          .play()
          .catch(() => {});
      }

      setRemoteConnected(true);
    };

    peer.onicecandidate = ({
      candidate,
    }) => {
      if (!candidate) return;

      socket.emit(
        "ice-candidate",
        {
          roomId,
          candidate,
        }
      );
    };

    peer.onconnectionstatechange =
      () => {
        console.log(
          "Connection:",
          peer.connectionState
        );

        if (
          peer.connectionState ===
          "connected"
        ) {
          setRemoteConnected(true);
        }

        if (
          [
            "failed",
            "closed",
            "disconnected",
          ].includes(
            peer.connectionState
          )
        ) {
          setRemoteConnected(false);
        }
      };

    peer.oniceconnectionstatechange =
      () => {
        console.log(
          "ICE:",
          peer.iceConnectionState
        );
      };

    return peer;
  };

  const initializeCall = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: true,
            audio: true,
          }
        );

      localStreamRef.current = stream;
      activeLocalStreamRef.current = stream;

      const peer =
        createPeerConnection();

      peerRef.current = peer;

      stream
        .getTracks()
        .forEach((track) => {
          peer.addTrack(
            track,
            stream
          );
        });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          stream;

        localVideoRef.current
          .play()
          .catch(() => {});
      }

      socket.emit(
        "join-room",
        roomId
      );

      socket.on(
        "screen-share-started",
        () => {
          setRemoteScreenSharing(
            true
          );
        }
      );

      socket.on(
        "screen-share-stopped",
        () => {
          setRemoteScreenSharing(
            false
          );
        }
      );

      socket.on(
        "user-joined",
        async () => {
          try {
            makingOfferRef.current =
              true;

            const offer =
              await peer.createOffer();

            if (
              peer.signalingState !==
              "stable"
            )
              return;

            await peer.setLocalDescription(
              offer
            );

            socket.emit(
              "offer",
              {
                roomId,
                offer:
                  peer.localDescription,
              }
            );
          } catch (err) {
            console.error(err);
          } finally {
            makingOfferRef.current =
              false;
          }
        }
      );

      socket.on(
        "offer",
        async (offer) => {
          try {
            const offerCollision =
              makingOfferRef.current ||
              peer.signalingState !==
                "stable";

            ignoreOfferRef.current =
              offerCollision;

            if (
              ignoreOfferRef.current
            )
              return;

            await peer.setRemoteDescription(
              new RTCSessionDescription(
                offer
              )
            );

            while (
              pendingCandidatesRef.current
                .length
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

            socket.emit(
              "answer",
              {
                roomId,
                answer:
                  peer.localDescription,
              }
            );
          } catch (err) {
            console.error(
              "Offer Error:",
              err
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
            )
              return;

            await peer.setRemoteDescription(
              new RTCSessionDescription(
                answer
              )
            );

            while (
              pendingCandidatesRef.current
                .length
            ) {
              const candidate =
                pendingCandidatesRef.current.shift();

              await peer.addIceCandidate(
                new RTCIceCandidate(
                  candidate
                )
              );
            }
          } catch (err) {
            console.error(
              "Answer Error:",
              err
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
          } catch (err) {
            console.error(
              "ICE Error:",
              err
            );
          }
        }
      );

      socket.on(
        "user-left",
        () => {
          setRemoteConnected(
            false
          );

          setRemoteScreenSharing(
            false
          );

          remoteStreamRef.current = null;

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
        "WebRTC Init Error:",
        error
      );
    }
  };

  const toggleMic = () => {
    const track =
      localStreamRef.current?.getAudioTracks()[0];

    if (!track) return;

    track.enabled =
      !track.enabled;

    setMicEnabled(
      track.enabled
    );
  };

  const toggleCamera = () => {
    const track =
      localStreamRef.current?.getVideoTracks()[0];

    if (!track) return;

    track.enabled =
      !track.enabled;

    setCameraEnabled(
      track.enabled
    );
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

      screenTrackRef.current = screenTrack;

      const sender =
        peerRef.current
          ?.getSenders()
          .find(
            (s) =>
              s.track?.kind ===
              "video"
          );

      if (!sender) return;

      // replaceTrack alone swaps the outgoing video over the
      // existing connection - no renegotiation needed, and
      // forcing one here would bypass the perfect-negotiation
      // guard (makingOfferRef) and risk colliding with it.
      await sender.replaceTrack(
        screenTrack
      );

      activeLocalStreamRef.current =
        screenStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          screenStream;

        localVideoRef.current
          .play()
          .catch(() => {});
      }

      setIsScreenSharing(true);

      socket.emit(
        "screen-share-started",
        roomId
      );

      // Fires both when the user clicks our in-app "Stop Sharing"
      // button (stopScreenShare calls screenTrack.stop(), which
      // triggers this) and when they use the browser's native
      // "Stop sharing" bar - one code path handles both.
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error(
        "Screen Share Error:",
        error
      );

      setIsScreenSharing(false);
    }
  };

  const stopScreenShare = async () => {
    try {
      if (!isScreenSharing) return;

      const sender =
        peerRef.current
          ?.getSenders()
          .find(
            (s) =>
              s.track?.kind ===
              "video"
          );

      const cameraTrack =
        localStreamRef.current?.getVideoTracks()[0];

      if (sender && cameraTrack) {
        await sender.replaceTrack(
          cameraTrack
        );
      }

      activeLocalStreamRef.current =
        localStreamRef.current;

      if (
        localVideoRef.current &&
        localStreamRef.current
      ) {
        localVideoRef.current.srcObject =
          localStreamRef.current;

        localVideoRef.current
          .play()
          .catch(() => {});
      }

      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      setIsScreenSharing(false);

      socket.emit(
        "screen-share-stopped",
        roomId
      );
    } catch (error) {
      console.error(
        "Stop Screen Share Error:",
        error
      );
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

      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
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

      remoteStreamRef.current = null;

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
    stopScreenShare,
    endCall,
    micEnabled,
    cameraEnabled,
    remoteConnected,
    isScreenSharing,
    remoteScreenSharing,
  };
}
