import React from "react";

const Output = ({ output }) => {
  return (
    <div className="h-full bg-black border-t border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-white/10 text-white text-sm font-medium flex-shrink-0">
        Output
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-green-400 text-sm whitespace-pre-wrap break-words font-mono">
          {output ||
            "Run code to see output..."}
        </pre>
      </div>
    </div>
  );
};

export default Output;
