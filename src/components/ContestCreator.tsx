import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Clock,
  MemoryStick,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Question {
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number;
  memoryLimit: number;
  points: number;
  testCases: TestCase;
}

interface ContestCreatorProps {
  darkMode: boolean;
}

const ContestCreator: React.FC<ContestCreatorProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [contestData, setContestData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      title: "",
      description: "",
      difficulty: "Easy",
      timeLimit: 2,
      memoryLimit: 256,
      points: 100,
      testCases: { input: "", expectedOutput: "" },
    },
  ]);

  const [activeQuestion, setActiveQuestion] = useState(0);

  const handleContestChange = (field: string, value: string) => {
    setContestData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const handleTestCaseChange = (
    questionIndex: number,
    field: "input" | "expectedOutput",
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].testCases = {
      ...updatedQuestions[questionIndex].testCases,
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        title: "",
        description: "",
        difficulty: "Easy",
        timeLimit: 1000,
        memoryLimit: 256,
        points: 100,
        testCases: { input: "", expectedOutput: "" },
      },
    ]);
    setActiveQuestion(questions.length);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
      if (activeQuestion >= updatedQuestions.length) {
        setActiveQuestion(updatedQuestions.length - 1);
      }
    }
  };

  const handleSaveContest = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving contest:", { contestData, questions });
    try {
      const res = await fetch("https://coding-platform-backend-ol9u.onrender.com/api/contest/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          multipleQues: questions,
          startTime: new Date(contestData.startTime),
          endTime: new Date(contestData.endTime),
          contesttitle: contestData.title,
          contestdesc: contestData.description,
        })
      });
      const body = await res.json();
      console.log(body);
      if (res.ok) {
        alert('Contest created successfully!');
        navigate('/');
      } else {
        alert(`Failed to create contest: ${body?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(error);
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
  

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900"
          : "bg-gradient-to-br from-orange-50 via-white to-orange-100"
      }`}
    >
      {/* Header */}
      <header
        className={`backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-300 ${
          darkMode
            ? "bg-gray-900/80 border-gray-700"
            : "bg-white/80 border-orange-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center transition-colors ${
                darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>
            <button
              onClick={handleSaveContest}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Contest
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel - Contest Info */}
          <div className="col-span-12 lg:col-span-4">
            <div
              className={`rounded-xl shadow-sm border p-6 sticky top-24 transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <h2
                className={`text-xl font-bold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Contest Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Contest Title
                  </label>
                  <input
                    type="text"
                    value={contestData.title}
                    onChange={(e) =>
                      handleContestChange("title", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Enter contest title"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Description
                  </label>
                  <textarea
                    value={contestData.description}
                    onChange={(e) =>
                      handleContestChange("description", e.target.value)
                    }
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Describe your contest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={contestData.startTime}
                      onChange={(e) =>
                        handleContestChange("startTime", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={contestData.endTime}
                      onChange={(e) =>
                        handleContestChange("endTime", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Questions ({questions.length})
                  </h3>
                  <button
                    onClick={addQuestion}
                    className="flex items-center px-3 py-1 text-sm bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveQuestion(index)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        activeQuestion === index
                          ? darkMode
                            ? "border-orange-500 bg-orange-900/20"
                            : "border-orange-300 bg-orange-50"
                          : darkMode
                          ? "border-gray-600 hover:border-gray-500 bg-gray-700"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className={`font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {question.title || `Question ${index + 1}`}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                                question.difficulty
                              )}`}
                            >
                              {question.difficulty}
                            </span>
                          </div>
                        </div>
                        {questions.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeQuestion(index);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Question Editor */}
          <div className="col-span-12 lg:col-span-8">
            <div
              className={`rounded-xl shadow-sm border p-6 transition-colors duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              <h2
                className={`text-xl font-bold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Question {activeQuestion + 1} Details
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Question Title
                    </label>
                    <input
                      type="text"
                      value={questions[activeQuestion].title}
                      onChange={(e) =>
                        handleQuestionChange(
                          activeQuestion,
                          "title",
                          e.target.value
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                      placeholder="Enter question title"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Difficulty
                    </label>
                    <select
                      value={questions[activeQuestion].difficulty}
                      onChange={(e) =>
                        handleQuestionChange(
                          activeQuestion,
                          "difficulty",
                          e.target.value
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <Clock className="h-4 w-4 inline mr-1" />
                      Time Limit (s)
                    </label>
                    <input
                      type="number"
                      value={questions[activeQuestion].timeLimit}
                      onChange={(e) =>
                        handleQuestionChange(
                          activeQuestion,
                          "timeLimit",
                          parseInt(e.target.value)
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <MemoryStick className="h-4 w-4 inline mr-1" />
                      Memory Limit (MB)
                    </label>
                    <input
                      type="number"
                      value={questions[activeQuestion].memoryLimit}
                      onChange={(e) =>
                        handleQuestionChange(
                          activeQuestion,
                          "memoryLimit",
                          parseInt(e.target.value)
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Points
                    </label>
                    <input
                      type="number"
                      value={questions[activeQuestion].points}
                      onChange={(e) =>
                        handleQuestionChange(
                          activeQuestion,
                          "points",
                          parseInt(e.target.value)
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Problem Description
                  </label>
                  <textarea
                    value={questions[activeQuestion].description}
                    onChange={(e) =>
                      handleQuestionChange(
                        activeQuestion,
                        "description",
                        e.target.value
                      )
                    }
                    rows={8}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Describe the problem, include examples, constraints, etc."
                  />
                </div>

                {/* Test Cases */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Test Cases
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {[questions[activeQuestion].testCases].map(
                      (testCase, testCaseIndex) => (
                        <div
                          key={testCaseIndex}
                          className={`border rounded-lg p-4 transition-colors ${
                            darkMode ? "border-gray-600" : "border-gray-200"
                          }`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label
                                className={`block text-sm font-medium mb-2 ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Input (separate multiple inputs with ###)
                              </label>
                              <textarea
                                value={testCase.input}
                                onChange={(e) =>
                                  handleTestCaseChange(activeQuestion, 'input', e.target.value)
                                }

                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm transition-colors ${
                                  darkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                                placeholder="Enter test input (use ### to separate multiple inputs)"
                              />
                            </div>
                            <div>
                              <label
                                className={`block text-sm font-medium mb-2 ${
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                Expected Output (separate multiple outputs with
                                ###)
                              </label>
                              <textarea
                                value={testCase.expectedOutput}
                                onChange={(e) =>
                                  handleTestCaseChange(activeQuestion, 'expectedOutput', e.target.value)
                                }

                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm transition-colors ${
                                  darkMode
                                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                                }`}
                                placeholder="Enter expected output (use ### to separate multiple outputs)"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestCreator;
