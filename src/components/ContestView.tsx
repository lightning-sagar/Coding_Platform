import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Trophy,
  Target,
  Star,
  Play,
  Users,
} from "lucide-react";
import { useRecoilState, useRecoilValue } from "recoil";
import ContestSelect from "../atoms/contestatom";
import QuestionSelectAtom, { type Question } from "../atoms/QuestionAtom";
import userAtom from "../atoms/UserAtom";
import Navbar from "./Navbar";

interface ContestViewProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ContestView: React.FC<ContestViewProps> = ({ darkMode, toggleDarkMode }) => {
  const [selecContest, setselecContest] = useRecoilState(ContestSelect);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showCountdown, _] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [selectedQuestion, setSelectedQuestion] =
    useRecoilState(QuestionSelectAtom);
  const navigate = useNavigate();
  const user = useRecoilValue(userAtom);
 
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/contest/fetch-multiple", {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selecContest.quesId }),
        });
        const data = await res.json();
        setQuestions(data.questions);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };

    if (selecContest?.quesId?.length > 0) {
      fetchQuestions();
    }
  }, [selecContest]);

  const start = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/contest/start", {
        method: "POST",
          credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selecContest._id }),
      });
      const body = await res.json();
      console.log(body);
      if (res.ok) {
        setselecContest(body.contest);
      }
    } catch (error) {
      console.log(`error ${error}`);
    }
  };

  const handleContinueContest = () => {
    if (
      selecContest.status === "ended"
    ) {
      navigate(`/${selecContest._id}/ranking`);
    }
    setCurrentView("full-page");
  };

  const handleStartContest = () => {
    if (
      selecContest.status === "ended"
    ) {
      navigate(`/${selecContest._id}/ranking`);
    }
    setCurrentView("countdown");
    start();
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setCurrentView("full-page");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleQuestionClick = (question: Question) => (_: React.MouseEvent) => {
    setSelectedQuestion(question);
    navigate("/question");
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

  const formatTime = (seconds: number) => `${Math.floor(seconds / 1000)}s`;

  if (showCountdown) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-white" : "bg-white"
        }`}
      >
        <div className="text-center">
          <div
            className={`text-8xl font-bold mb-4 animate-pulse ${
              darkMode ? "text-orange-400" : "text-orange-600"
            }`}
          >
            {countdown}
          </div>
          <p className="text-2xl">Starting {selectedQuestion?.title}...</p>
        </div>
      </div>
    );
  }
  const [currentView, setCurrentView] = useState<
    "contest-info" | "countdown" | "full-page"
  >("contest-info");
  if (currentView === "contest-info") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
        }`}
      >
        <div
          className={`max-w-2xl w-full rounded-2xl p-8 shadow-2xl border backdrop-blur-sm ${
            darkMode
              ? "bg-slate-800/90 border-slate-700/50 text-white"
              : "bg-white/90 border-slate-200 text-slate-900"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                darkMode
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              <Trophy className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-3">
              {selecContest.contesttitle}
            </h1>
            <p
              className={`text-lg leading-relaxed ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {selecContest.contestdesc}
            </p>
          </div>

          {/* Contest Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div
              className={`p-4 rounded-xl border ${
                darkMode
                  ? "bg-slate-700/50 border-slate-600/50"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center mb-2">
                <Target
                  className={`w-5 h-5 mr-2 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <span className="font-semibold">Problems</span>
              </div>
              <p className="text-2xl font-bold">{selecContest.quesId.length}</p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                darkMode
                  ? "bg-slate-700/50 border-slate-600/50"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center mb-2">
                <Users
                  className={`w-5 h-5 mr-2 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
                <span className="font-semibold">Participants</span>
              </div>
              <p className="text-2xl font-bold">
                {selecContest?.userId.length}
              </p>
            </div>
          </div>

          {/* Contest Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="font-medium">Difficulty:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                  selecContest.difficulty
                )}`}
              >
                {selecContest.difficulty}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode
                    ? "text-emerald-400 bg-emerald-900/20 border border-emerald-700/50"
                    : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                }`}
              >
                {selecContest.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Duration:</span>
              <div className="flex items-center">
                <Clock
                  className={`w-4 h-4 mr-1 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                />
                <span className="text-sm">
                  {new Date(selecContest.startTime).toLocaleTimeString()} -{" "}
                  {new Date(selecContest.endTime).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {!selecContest.userId.includes(user._id) &&
          selecContest.status === "active" ? (
            <button
              onClick={handleStartContest}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Start Contest
            </button>
          ) : (
            <button
              onClick={handleContinueContest}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }
  // Countdown View
  if (currentView === "countdown") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
        }`}
      >
        <div className="text-center">
          <div
            className={`text-9xl font-bold mb-8 animate-pulse ${
              darkMode ? "text-orange-400" : "text-orange-600"
            } drop-shadow-2xl`}
          >
            {countdown}
          </div>
          <p
            className={`text-2xl font-medium ${
              darkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Starting {selecContest.contesttitle}...
          </p>
          <div
            className={`mt-4 w-32 h-1 mx-auto rounded-full ${
              darkMode ? "bg-slate-700" : "bg-slate-200"
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                darkMode ? "bg-orange-400" : "bg-orange-600"
              }`}
              style={{ width: `${((4 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Full Page View
  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900"
      }`}
    >
      {/* Header */}
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Contest Info - Compact Version */}
        <div
          className={`rounded-2xl p-6 shadow-xl border mb-8 ${
            darkMode
              ? "bg-slate-800/50 border-slate-700/50 backdrop-blur-sm"
              : "bg-white/80 border-slate-200 backdrop-blur-sm"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {selecContest.contesttitle}
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {selecContest.contestdesc}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                selecContest.difficulty
              )}`}
            >
              {selecContest.difficulty}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center">
              <Clock
                className={`w-4 h-4 mr-2 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <span>
                {new Date(selecContest.startTime).toLocaleTimeString()} -{" "}
                {new Date(selecContest.endTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center">
              <Target
                className={`w-4 h-4 mr-2 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <span>{selecContest.quesId.length} Problems</span>
            </div>
            <div className="flex items-center">
              <Users
                className={`w-4 h-4 mr-2 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <span>{selecContest?.userId.length} Participants</span>
            </div>
            <div className="flex items-center">
              <Star
                className={`w-4 h-4 mr-2 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <span>Your Score: 0</span>
            </div>
          </div>
        </div>

        {/* Problems Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Trophy
              className={`w-6 h-6 mr-3 ${
                darkMode ? "text-orange-400" : "text-orange-600"
              }`}
            />
            Problems
          </h2>

          <div className="grid gap-4">
            {questions.length === 0 ? (
              <div
                className={`p-8 text-center rounded-xl border ${
                  darkMode
                    ? "bg-slate-800/50 border-slate-700/50 text-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No questions found</p>
              </div>
            ) : (
              questions.map((q, index) => (
                <div
                  key={q._id}
                  className={`p-6 border rounded-xl transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                    darkMode
                      ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600"
                      : "bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300"
                  }`}
                  onClick={handleQuestionClick(q)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3
                      className={`text-lg font-semibold group-hover:text-orange-500 transition-colors ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}. {q.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(
                        q.difficulty
                      )}`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock
                        className={`w-4 h-4 mr-1 ${
                          darkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      />
                      <span>Time: {formatTime(q.timeLimit)}</span>
                    </div>
                    <div className="flex items-center">
                      <Target
                        className={`w-4 h-4 mr-1 ${
                          darkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      />
                      <span>Memory: {q.memoryLimit}MB</span>
                    </div>
                    <div className="flex items-center">
                      <Star
                        className={`w-4 h-4 mr-1 ${
                          darkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      />
                      <span>Points: {q.points}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestView;
