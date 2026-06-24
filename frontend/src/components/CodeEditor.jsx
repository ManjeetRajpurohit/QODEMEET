import React, { useContext, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Play } from "lucide-react";
import axios from "axios";
import { AppContext } from "../context/Appcontext.jsx";

const CodeEditor = ({
code,
setCode,
language,
setLanguage,
role,
socket,
roomId,
setOutput,
}) => {
const editorRef = useRef(null);
const { backendUrl } = useContext(AppContext);

const handleEditorDidMount = (editor) => {
editorRef.current = editor;

```
if (role === "candidate" && socket) {
  editor.onDidChangeCursorPosition((event) => {
    socket.emit("cursor-change", {
      roomId,
      lineNumber: event.position.lineNumber,
      column: event.position.column,
    });
  });
}
```

};

const handleCodeChange = (value) => {
const updatedCode = value || "";

```
if (role === "candidate") {
  setCode(updatedCode);

  socket?.emit("code-change", {
    roomId,
    code: updatedCode,
  });
}
```

};

const handleLanguageChange = (e) => {
const newLanguage = e.target.value;

```
setLanguage(newLanguage);

if (role === "candidate") {
  socket?.emit("language-change", {
    roomId,
    language: newLanguage,
  });
}
```

};

const runCode = async () => {
try {
setOutput("Running...");

```
  const response = await axios.post(
    backendUrl + "/api/code/run",
    {
      code,
      language,
    }
  );

  if (response.data.success) {
    setOutput(response.data.output);
  } else {
    setOutput(response.data.message);
  }
} catch (error) {
  console.error(error);

  setOutput(
    error.response?.data?.message ||
      error.message ||
      "Something went wrong"
  );
}
```

};

return ( <div className="h-full flex flex-col overflow-hidden bg-[#020617]"> <div className="border-b border-white/10 px-4 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between flex-shrink-0"> <div className="flex items-center gap-3 flex-wrap">
<select
value={language}
onChange={handleLanguageChange}
disabled={role === "interviewer"}
className="bg-[#0B1220] border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
> <option value="typescript">TypeScript</option> <option value="javascript">JavaScript</option> <option value="python">Python</option> <option value="java">Java</option> <option value="cpp">C++</option> </select>

```
      <span className="text-gray-400 text-sm">
        solution.{language}
      </span>
    </div>

    <button
      onClick={runCode}
      className="px-4 py-2 border border-white/10 rounded-lg text-white flex items-center gap-2 hover:bg-[#0B1220] transition-all duration-200"
    >
      <Play size={15} />
      Run
    </button>
  </div>

  <div className="flex-1 min-h-0 overflow-hidden">
    <Editor
      height="100%"
      theme="vs-dark"
      language={language}
      value={code}
      onChange={handleCodeChange}
      onMount={handleEditorDidMount}
      options={{
        readOnly: role === "interviewer",
        minimap: {
          enabled: false,
        },
        fontSize: 15,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: "on",
        smoothScrolling: true,
        padding: {
          top: 12,
        },
      }}
    />
  </div>
</div>
```

);
};

export default CodeEditor;
