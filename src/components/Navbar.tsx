import { Trophy } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import userAtom from "../atoms/UserAtom";

interface NavbarPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarPageProps> = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [user,setUser] = useRecoilState(userAtom);
  const handleLogout = async() =>{
    try {
      const res = await fetch('https://coding-platform-backend-ol9u.onrender.com/api/user/logout',{
        method:"POST"
      })
      if(res.ok){
        setUser(null);            
      localStorage.removeItem('user'); 
        navigate('/');
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <header
      className={`backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900/80 border-gray-700"
          : "bg-white/80 border-orange-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-orange-600" />
            <h1
              className={`ml-2 text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              CodeContest
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            {user && (user.accountType!=="student") && (
              <>
                <button
                  onClick={() => navigate("create-contest")}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Create Contest
                </button>
              </>
            )}

            {!user ? (
                <button
                  onClick={() => navigate("login")}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    darkMode
                      ? "text-orange-400 border-orange-400 hover:bg-orange-900/20"
                      : "text-orange-600 border-orange-600 hover:bg-orange-50"
                  }`}
                >
                  Login
                </button>
            ) : (
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    darkMode
                      ? "text-orange-400 border-orange-400 hover:bg-orange-900/20"
                      : "text-orange-600 border-orange-600 hover:bg-orange-50"
                  }`}
                >
                  logout
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
