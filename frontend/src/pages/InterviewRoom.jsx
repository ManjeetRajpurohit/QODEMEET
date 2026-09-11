import React, { useContext, useEffect, useMemo, useState } from "react";
import PresentationView from "../components/PresentationView";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";

import { AppContext } from "../context/Appcontext.jsx";

import QuestionPanel from "../components/QuestionPanel.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import VideoSection from "../components/VideoSection.jsx";
import BottomControls from "../components/BottomControls.jsx";
import Output from "../components/Output.jsx";

import useWebRTC from "../hooks/useWebRTC";

const MOBILE_BREAKPOINT = 1024;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.innerWidth < MOBILE_BREAKPOINT
      : false,
  );

  useEffect(() => {
    const handleResize = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

const InterviewRoom = () => {
  const { roomId } = useParams();

  const { user, token, backendUrl, navigate } = useContext(AppContext);

  const isMobile = useIsMobile();

  const [mobileTab, setMobileTab] = useState("code");

  const socket = useMemo(
    () =>
      io(backendUrl, {
        transports: ["websocket"],
      }),
    [backendUrl],
  );

  const {
    localVideoRef,
    remoteVideoRef,
    toggleMic,
    toggleCamera,
    shareScreen,
    stopScreenShare,
    endCall,
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    remoteScreenSharing,
  } = useWebRTC(socket, roomId);

  const [interview, setInterview] = useState(null);

  const [activeQuestion, setActiveQuestion] = useState(null);

  const [messages, setMessages] = useState([]);

  const [inputMessage, setInputMessage] = useState("");

  const [language, setLanguage] = useState("javascript");

  const [code, setCode] = useState("");

  const [output, setOutput] = useState("");

  const isPresentationMode = isScreenSharing || remoteScreenSharing;

  const fetchInterview = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/interview/${roomId}`,
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        setInterview(response.data.interview);

        if (response.data.interview.questions?.length > 0) {
          setActiveQuestion(response.data.interview.questions[0]);
        }

        setLanguage(response.data.interview.language || "javascript");
      } else {
        toast.error(response.data.message);
        navigate("/dashboard/interviews");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEndInterview = async () => {
    try {
      if (user?.role === "candidate") {
        endCall();
        navigate("/dashboard/interviews");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/interview/end/${roomId}`,
        {},
        {
          headers: {
            token,
          },
        },
      );

      if (response.data.success) {
        socket.emit("interview-ended", roomId);

        endCall();

        toast.success("Interview completed");

        navigate(`/dashboard/add-report/${roomId}`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token && roomId) {
      fetchInterview();
    }
  }, [token, roomId]);

  useEffect(() => {
    socket.on("receive-message", (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    socket.on("receive-code-change", (data) => {
      if (user?.role === "interviewer") {
        setCode(data.code);
      }
    });

    socket.on("receive-language-change", (data) => {
      if (user?.role === "interviewer") {
        setLanguage(data.language);
      }
    });

    socket.on("interview-ended", () => {
      toast.info("Interview has ended");

      endCall();

      navigate("/dashboard/interviews");
    });

    return () => {
      socket.off("receive-message");
      socket.off("receive-code-change");
      socket.off("receive-language-change");
      socket.off("interview-ended");
    };
  }, [socket, user]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("SOCKET DISCONNECTED");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const messageData = {
      interviewId: roomId,
      sender: user?._id,
      senderName: user?.name,
      message: inputMessage,
      createdAt: new Date(),
    };

    socket.emit("send-message", messageData);

    setInputMessage("");
  };

  if (!interview) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading Interview...
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between flex-shrink-0 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="text-white font-semibold text-lg truncate">
              {interview.title}
            </h1>

            <p className="text-xs text-gray-400 truncate">Room #{roomId}</p>
          </div>
        </div>

        <div className="bg-[#0B1220] border border-white/10 rounded-xl px-4 py-2 text-white text-sm capitalize flex-shrink-0">
          {user?.role}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-hidden">
        {isPresentationMode ? (
          <PresentationView
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            isScreenSharing={isScreenSharing}
            remoteScreenSharing={remoteScreenSharing}
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            role={user?.role}
            socket={socket}
            roomId={roomId}
            activeQuestion={activeQuestion}
            setOutput={setOutput}
            messages={messages}
            user={user}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
          />
        ) : isMobile ? (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Compact always-on video strip */}
            <div className="h-24 flex-shrink-0 border-b border-white/10">
              <VideoSection
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                isScreenSharing={isScreenSharing}
              />
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-white/10 flex-shrink-0">
              {["question", "code", "chat"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMobileTab(tab)}
                  className={`flex-1 py-2.5 text-sm capitalize transition ${
                    mobileTab === tab
                      ? "text-white border-b-2 border-violet-500 bg-white/5"
                      : "text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Active tab content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {mobileTab === "question" && (
                <QuestionPanel
                  questions={interview.questions || []}
                  activeQuestion={activeQuestion}
                  setActiveQuestion={setActiveQuestion}
                />
              )}

              {mobileTab === "code" && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 min-h-0 border-b border-white/10">
                    <CodeEditor
                      code={code}
                      setCode={setCode}
                      language={language}
                      setLanguage={setLanguage}
                      role={user?.role}
                      socket={socket}
                      roomId={roomId}
                      questionId={activeQuestion?._id}
                      setOutput={setOutput}
                    />
                  </div>

                  <div className="h-40 flex-shrink-0">
                    <Output output={output} />
                  </div>
                </div>
              )}

              {mobileTab === "chat" && (
                <ChatPanel
                  messages={messages}
                  user={user}
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  handleSendMessage={handleSendMessage}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex overflow-hidden">
            {/* Question column */}
            <div className="w-[380px] flex-shrink-0 border-r border-white/10 overflow-hidden">
              <QuestionPanel
                questions={interview.questions || []}
                activeQuestion={activeQuestion}
                setActiveQuestion={setActiveQuestion}
              />
            </div>

            {/* Code + Output column */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 border-b border-white/10">
                <CodeEditor
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  role={user?.role}
                  socket={socket}
                  roomId={roomId}
                  questionId={activeQuestion?._id}
                  setOutput={setOutput}
                />
              </div>

              <div className="h-40">
                <Output output={output} />
              </div>
            </div>

            {/* Video + Chat column */}
            <div className="w-[420px] border-l border-white/10 flex flex-col overflow-hidden">
              <div className="h-[320px] border-b border-white/10">
                <VideoSection
                  localVideoRef={localVideoRef}
                  remoteVideoRef={remoteVideoRef}
                  isScreenSharing={isScreenSharing}
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
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex-shrink-0">
        <BottomControls
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          shareScreen={shareScreen}
          stopScreenShare={stopScreenShare}
          endCall={handleEndInterview}
          micEnabled={micEnabled}
          cameraEnabled={cameraEnabled}
          isScreenSharing={isScreenSharing}
          userRole={user?.role}
        />
      </div>
    </div>
  );
};

export default InterviewRoom;