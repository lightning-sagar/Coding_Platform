import { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import MainPage from "./components/MainPage.tsx";
import ContestView from "./components/ContestView";
import QuestionView from "./components/QuestionView";
import AuthPages from "./components/AuthPages";
import ContestCreator from "./components/ContestCreator";
import { useRecoilValue } from "recoil";
import ContestSelect from "./atoms/contestatom.ts";
import QuestionSelectAtom from "./atoms/QuestionAtom.ts";
import userAtom from "./atoms/UserAtom.ts";
import RankingPage from "./components/RankingPage.tsx";

function App() {
  const selectedQuestion = useRecoilValue(QuestionSelectAtom);
  const selectContest = useRecoilValue(ContestSelect);
  const [darkMode, setDarkMode] = useState(true);
  const user = useRecoilValue(userAtom);
  console.log(selectedQuestion);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <MainPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            }
          />
          <Route
            path="/:cid/ranking"
            element={
              <RankingPage darkMode={darkMode}/>
            }
          />
          <Route
            path="/contest"
            element={
              selectContest._id ? (
                <ContestView darkMode={darkMode} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/question"
            element={
              selectedQuestion._id ? (
                <QuestionView darkMode={darkMode} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPages darkMode={darkMode} />
              )
            }
          />

          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPages darkMode={darkMode} />
              )
            }
          />

          {/* Contest Creator Page */}
          <Route
            path="/create-contest"
            element={<ContestCreator darkMode={darkMode} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
