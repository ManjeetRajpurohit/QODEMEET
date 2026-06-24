import React, {
useEffect,
useRef,
} from "react";
import { Send } from "lucide-react";

const ChatPanel = ({
messages,
user,
inputMessage,
setInputMessage,
handleSendMessage,
}) => {
const messagesEndRef =
useRef(null);

useEffect(() => {
messagesEndRef.current?.scrollIntoView(
{
behavior: "smooth",
}
);
}, [messages]);

return ( <div className="h-full flex flex-col bg-[#020617] overflow-hidden">
{/* Header */} <div className="border-b border-white/10 px-4 py-3 text-white font-medium flex-shrink-0">
Chat </div>

```
  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-3 space-y-3">
    {messages.length === 0 ? (
      <div className="text-gray-500 text-sm text-center mt-5">
        No messages yet
      </div>
    ) : (
      messages.map(
        (msg, index) => {
          const isOwnMessage =
            msg.sender ===
            user?._id;

          return (
            <div
              key={index}
              className={
                isOwnMessage
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div className="max-w-[80%]">
                {!isOwnMessage && (
                  <p className="text-xs text-violet-400 mb-1">
                    {msg.senderName ||
                      "User"}
                  </p>
                )}

                <div
                  className={
                    isOwnMessage
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 p-3 rounded-xl text-white break-words"
                      : "bg-[#0B1220] border border-white/10 p-3 rounded-xl text-white break-words"
                  }
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        }
      )
    )}

    <div ref={messagesEndRef} />
  </div>

  {/* Input */}
  <div className="border-t border-white/10 p-3 flex gap-2 flex-shrink-0">
    <input
      value={inputMessage}
      onChange={(e) =>
        setInputMessage(
          e.target.value
        )
      }
      onKeyDown={(e) => {
        if (
          e.key === "Enter"
        ) {
          handleSendMessage();
        }
      }}
      placeholder="Send a message..."
      className="flex-1 bg-[#0B1220] rounded-xl px-4 py-2 text-white outline-none border border-white/10"
    />

    <button
      onClick={
        handleSendMessage
      }
      className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center text-white"
    >
      <Send size={16} />
    </button>
  </div>
</div>
```

);
};

export default ChatPanel;
