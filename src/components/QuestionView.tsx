import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, MemoryStick, Upload, Check, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import QuestionSelectAtom from "../atoms/QuestionAtom";

type TestCase = {
  id: string;
  input: string;
  expectedOutput: string;
  status?: "pass" | "fail" | "pending";
  actualOutput?: string;
  executionTime?: string;
};

type TestResult = {
  input: string;
  expected_output: string;
  result: string;
  correct: boolean;
  timeout: string;
};

type ApiResponse = {
  message: string;
  allPassed: boolean;
  jobId: string;
  results: TestResult[];
};

type QuestionViewProps = {
  darkMode: boolean;
};

const QuestionView: React.FC<QuestionViewProps> = ({ darkMode }) => {
  const question = useRecoilValue(QuestionSelectAtom);
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState<
    "python" | "java" | "cpp"
  >("python");
  const [file, setFile] = useState<File | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "running" | "completed" | "error"
  >("idle");
  const [visibleTestCases, setVisibleTestCases] = useState<TestCase[]>([]);
  const [hiddenTestCases, setHiddenTestCases] = useState<TestCase[]>([]);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const languages = [
    { value: "python", label: "Python", extension: ".py" },
    { value: "java", label: "Java", extension: ".java" },
    { value: "cpp", label: "C++", extension: ".cpp" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Reset submission status when new file is uploaded
      setSubmissionStatus("idle");
      setApiResponse(null);
    }
  };

  useEffect(() => {
    if (!question?.input || !question?.expectedOutput) return;

    const inputParts = question.input.split("###").map((s) => s.trim());
    const outputParts = question.expectedOutput
      .split("###")
      .map((s) => s.trim());

    const testCases: TestCase[] = inputParts.map((input, idx) => ({
      id: (idx + 1).toString(),
      input,
      expectedOutput: outputParts[idx] || "",
      status: "pending",
    }));

    setVisibleTestCases(testCases.slice(0, 2));
    setHiddenTestCases(testCases.slice(2));
  }, [question]);

  const updateTestCasesWithResults = (results: TestResult[]) => {
    // Update visible test cases
    setVisibleTestCases(prev => 
      prev.map((testCase, index) => {
        const result = results[index];
        if (result) {
          return {
            ...testCase,
            status: result.correct ? "pass" : "fail",
            actualOutput: result.result.trim(),
            executionTime: result.timeout,
          };
        }
        return testCase;
      })
    );

    // Update hidden test cases
    setHiddenTestCases(prev => 
      prev.map((testCase, index) => {
        const resultIndex = visibleTestCases.length + index;
        const result = results[resultIndex];
        if (result) {
          return {
            ...testCase,
            status: result.correct ? "pass" : "fail",
            actualOutput: result.result.trim(),
            executionTime: result.timeout,
          };
        }
        return testCase;
      })
    );
  };

  const handleSubmit = async () => {
    if (!file) return;
    setSubmissionStatus("running");
    
    // Reset test cases to pending state
    setVisibleTestCases(prev => prev.map(tc => ({ ...tc, status: "pending" as const })));
    setHiddenTestCases(prev => prev.map(tc => ({ ...tc, status: "pending" as const })));
    
    const code = await file.text();  
    const allTestCases = [...visibleTestCases, ...hiddenTestCases];
    const input = allTestCases.map((tc) => tc.input.trim()).join("###");
    const output = allTestCases
      .map((tc) => tc.expectedOutput.trim())
      .join("###");
    
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          qId: question._id,
          language: selectedLanguage,
          input,
          output,
          timeout: String(question.timeLimit || 3),
        }),
      });
      
      const result: ApiResponse = await res.json();
      
      if (!res.ok) throw new Error(result.message || "Submission failed");
      
      setApiResponse(result);
      updateTestCasesWithResults(result.results);
      setSubmissionStatus("completed");
    } catch (err) {
      console.error("Submission error:", err);
      setSubmissionStatus("error");
      // Set all test cases to fail on error
      setVisibleTestCases(prev => prev.map(tc => ({ ...tc, status: "fail" as const })));
      setHiddenTestCases(prev => prev.map(tc => ({ ...tc, status: "fail" as const })));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    if (darkMode) {
      switch (difficulty) {
        case "Easy":
          return "text-green-400 bg-green-900/30 border-green-700";
        case "Medium":
          return "text-yellow-400 bg-yellow-900/30 border-yellow-700";
        case "Hard":
          return "text-red-400 bg-red-900/30 border-red-700";
        default:
          return "text-gray-400 bg-gray-800 border-gray-600";
      }
    } else {
      switch (difficulty) {
        case "Easy":
          return "text-green-600 bg-green-100 border-green-200";
        case "Medium":
          return "text-yellow-600 bg-yellow-100 border-yellow-200";
        case "Hard":
          return "text-red-600 bg-red-100 border-red-200";
        default:
          return "text-gray-600 bg-gray-100 border-gray-200";
      }
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pass":
        return <Check className="h-4 w-4 text-green-500" />;
      case "fail":
        return <X className="h-4 w-4 text-red-500" />;
      case "pending":
        return <div className="h-4 w-4 bg-gray-400 rounded-full animate-pulse" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusBorder = (status?: string) => {
    if (darkMode) {
      switch (status) {
        case "pass":
          return "border-green-700 bg-green-900/20";
        case "fail":
          return "border-red-700 bg-red-900/20";
        default:
          return "border-gray-600";
      }
    } else {
      switch (status) {
        case "pass":
          return "border-green-300 bg-green-50";
        case "fail":
          return "border-red-300 bg-red-50";
        default:
          return "border-gray-200";
      }
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b sticky top-0 z-50 backdrop-blur-sm transition-colors duration-300 ${
          darkMode ? "bg-gray-800/95 border-gray-700" : "bg-white/95 border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center px-3 py-2 rounded-lg transition-all hover:scale-105 ${
                darkMode
                  ? "text-gray-400 hover:text-white hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Contest
            </button>
            <div className="flex items-center space-x-6">
              <div
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  darkMode ? "text-gray-300 bg-gray-700" : "text-gray-600 bg-gray-100"
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                <span>02:45:32</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getDifficultyColor(
                  question.difficulty
                )}`}
              >
                {question.difficulty}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6 ">
          {/* Left Panel - Question Description */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div
              className={`rounded-xl shadow-lg border p-6 h-full overflow-y-auto transition-all duration-300 hover:shadow-xl ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h1
                className={`text-3xl font-bold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {question.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    darkMode ? "text-gray-300 bg-gray-700" : "text-gray-600 bg-gray-100"
                  }`}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Time: {question.timeLimit / 1000}s</span>
                </div>
                <div
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    darkMode ? "text-gray-300 bg-gray-700" : "text-gray-600 bg-gray-100"
                  }`}
                >
                  <MemoryStick className="h-4 w-4 mr-2" />
                  <span>Memory: {question.memoryLimit}MB</span>
                </div>
                <div className="px-3 py-2 rounded-lg text-sm font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                  {question.points} points
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <div
                  className={`whitespace-pre-wrap leading-relaxed text-base ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {question.desc}
                </div>
              </div>

              <div
                className={`mt-8 pt-6 border-t ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <h3
                  className={`font-bold text-lg mb-4 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Sample Input/Output
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Input
                    </label>
                    <pre
                      className={`border-2 rounded-xl p-4 text-sm font-mono transition-all hover:shadow-md ${
                        darkMode
                          ? "bg-gray-900 border-gray-600 text-gray-300"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    >
                      {question.input}
                    </pre>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Output
                    </label>
                    <pre
                      className={`border-2 rounded-xl p-4 text-sm font-mono transition-all hover:shadow-md ${
                        darkMode
                          ? "bg-gray-900 border-gray-600 text-gray-300"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    >
                      {question.expectedOutput}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Panel - File Upload */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div
              className={`rounded-xl shadow-lg border p-6 h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Solution Upload
                </h2>
                <select
                  value={selectedLanguage}
                  onChange={(e) =>
                    setSelectedLanguage(
                      e.target.value as "python" | "java" | "cpp"
                    )
                  }
                  className={`px-4 py-2 border-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div className="flex-1 flex flex-col">
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Upload Code File (
                  {
                    languages.find((l) => l.value === selectedLanguage)
                      ?.extension
                  }
                  )
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex-1 flex flex-col justify-center hover:scale-105 ${
                    file 
                      ? (darkMode ? "border-green-500 bg-green-900/20" : "border-green-400 bg-green-50")
                      : (darkMode ? "border-gray-600 hover:border-orange-400 bg-gray-900/50" : "border-gray-300 hover:border-orange-400 bg-gray-50")
                  }`}
                >
                  <input
                    type="file"
                    accept={
                      languages.find((l) => l.value === selectedLanguage)
                        ?.extension
                    }
                    name="code"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className={`p-4 rounded-full mb-4 ${
                      file 
                        ? "bg-green-100 text-green-600" 
                        : (darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500")
                    }`}>
                      {file ? <Check className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                    </div>
                    <span
                      className={`text-lg font-semibold mb-2 ${
                        file 
                          ? (darkMode ? "text-green-400" : "text-green-600")
                          : (darkMode ? "text-gray-300" : "text-gray-600")
                      }`}
                    >
                      {file ? `✓ ${file.name}` : "Click to upload your solution"}
                    </span>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {file ? "Click to change file" : "Drag and drop or click to browse"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submission Status */}
              {apiResponse && (
                <div className={`mt-4 p-4 rounded-lg border-2 ${
                  apiResponse.allPassed 
                    ? (darkMode ? "border-green-700 bg-green-900/20" : "border-green-300 bg-green-50")
                    : (darkMode ? "border-red-700 bg-red-900/20" : "border-red-300 bg-red-50")
                }`}>
                  <div className="flex items-center">
                    {apiResponse.allPassed ? (
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={`font-semibold ${
                      apiResponse.allPassed 
                        ? "text-green-600" 
                        : "text-red-600"
                    }`}>
                      {apiResponse.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div
                className={`mt-6 pt-4 border-t ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <button
                  onClick={handleSubmit}
                  disabled={!file || submissionStatus === "running"}
                  className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    !file || submissionStatus === "running"
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {submissionStatus === "running" ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-3" />
                      Submit Solution
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Test Cases */}
          <div className="col-span-12 lg:col-span-3">
            <div
              className={`rounded-xl shadow-lg border p-6 h-full overflow-y-auto transition-all duration-300 hover:shadow-xl ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2
                className={`text-xl font-bold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Test Cases
              </h2>

              {/* Visible Test Cases */}
              <div className="space-y-4 mb-6">
                {visibleTestCases.map((testCase, index) => (
                  <div
                    key={testCase.id}
                    className={`border-2 rounded-xl p-4 transition-all hover:shadow-md ${
                      getStatusBorder(testCase.status)
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-sm font-semibold ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Sample {index + 1}
                      </span>
                      <div className="flex items-center space-x-2">
                        {testCase.executionTime && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                          }`}>
                            {testCase.executionTime}s
                          </span>
                        )}
                        {getStatusIcon(testCase.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Input:
                        </label>
                        <pre
                          className={`text-xs p-3 rounded-lg border font-mono mt-1 transition-colors ${
                            darkMode
                              ? "bg-gray-900 border-gray-600 text-gray-300"
                              : "bg-gray-50 border-gray-200 text-gray-900"
                          }`}
                        >
                          {testCase.input}
                        </pre>
                      </div>
                      
                      <div>
                        <label
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Expected Output:
                        </label>
                        <pre
                          className={`text-xs p-3 rounded-lg border font-mono mt-1 transition-colors ${
                            darkMode
                              ? "bg-gray-900 border-gray-600 text-gray-300"
                              : "bg-gray-50 border-gray-200 text-gray-900"
                          }`}
                        >
                          {testCase.expectedOutput}
                        </pre>
                      </div>

                      {testCase.actualOutput && (
                        <div>
                          <label
                            className={`text-xs font-semibold uppercase tracking-wide ${
                              testCase.status === "pass" 
                                ? "text-green-500" 
                                : testCase.status === "fail" 
                                ? "text-red-500" 
                                : (darkMode ? "text-gray-400" : "text-gray-500")
                            }`}
                          >
                            Your Output:
                          </label>
                          <pre
                            className={`text-xs p-3 rounded-lg border font-mono mt-1 transition-colors ${
                              testCase.status === "pass"
                                ? (darkMode ? "bg-green-900/20 border-green-700 text-green-300" : "bg-green-50 border-green-200 text-green-800")
                                : testCase.status === "fail"
                                ? (darkMode ? "bg-red-900/20 border-red-700 text-red-300" : "bg-red-50 border-red-200 text-red-800")
                                : (darkMode ? "bg-gray-900 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-900")
                            }`}
                          >
                            {testCase.actualOutput}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Hidden Test Cases Status */}
              {hiddenTestCases.length > 0 && (
                <div>
                  <h3
                    className={`text-sm font-semibold mb-4 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Hidden Test Cases ({hiddenTestCases.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {hiddenTestCases.map((testCase, index) => (
                      <div
                        key={testCase.id}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                          getStatusBorder(testCase.status)
                        }`}
                      >
                        <span
                          className={`text-xs font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Test {visibleTestCases.length + index + 1}
                        </span>
                        <div className="flex items-center space-x-2">
                          {testCase.executionTime && (
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              darkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
                            }`}>
                              {testCase.executionTime}s
                            </span>
                          )}
                          {getStatusIcon(testCase.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionView;