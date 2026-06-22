import axios from "axios";

const languageMap = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
};

const runCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    const language_id = languageMap[language];

    if (!language_id) {
      return res.status(400).json({
        success: false,
        message: "Unsupported Language",
      });
    }

    const response = await axios.post(
      `https://${process.env.RAPID_API_HOST}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id,
        stdin: "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": process.env.RAPID_API_HOST,
        },
      }
    );

    const result = response.data;

    return res.json({
      success: true,
      output:
        result.stdout ||
        result.stderr ||
        result.compile_output ||
        "No Output",
    });
  } catch (error) {
    console.log(
      "Judge0 Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Execution Failed",
    });
  }
};

export { runCode };