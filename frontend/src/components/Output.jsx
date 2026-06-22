import React from "react";

const Output = ({ output }) => {
  return (
    <div className="h-40 bg-black text-green-400 p-4 overflow-auto border-t border-white/10">
      <pre>{output || "Run code to see output..."}</pre>
    </div>
  );
};

export default Output;