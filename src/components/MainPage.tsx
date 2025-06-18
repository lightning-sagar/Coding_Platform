import React, { useEffect, useState } from 'react';
import { Clock, Trophy, Filter } from 'lucide-react';
import Navbar from './Navbar.tsx';
import { useNavigate } from 'react-router-dom';
import ContestSelect from '../atoms/contestatom.ts';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { AllcontestAtom } from '../atoms/AllcontestAtom.ts';

interface MainPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}
export interface ContestType {
  _id: string;
  contesttitle: string;
  contestdesc: string;
  createdby: string;
  startTime: string;
  endTime: string;
  quesId: string[];
  userId: string[];
  __v: number;

  // extra computed fields
  difficulty: 'Easy' | 'Medium' | 'Hard';
  participants: number;
  totalQuestions: number;
  status: 'active' | 'upcoming' | 'ended';
}
const MainPage: React.FC<MainPageProps> = ({ darkMode, toggleDarkMode }) => {
  const [contest, setContest] = useRecoilState(AllcontestAtom);
  const setselectContest = useSetRecoilState(ContestSelect);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  useEffect(() => {
    const getContest = async () => {
      try {
        const res = await fetch("/api/contest/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const body = await res.json();
        console.log(body)
        const enrichedContests = body.alllist.map((c: any) => ({
          ...c,
          difficulty: 'Medium', // Default
          participants: c.userId?.length || 0,
          totalQuestions: c.quesId?.length || 0,
          status: calculateStatus(c.startTime, c.endTime)
        }));
        setContest(enrichedContests);
      } catch (error) {
        console.error("Failed to fetch contests", error);
      }
    };
    getContest();
  }, [setContest]);

  const calculateStatus = (start: string, end: string) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'ended';
  };

  const filteredContests = (contest as ContestType[]).filter((c: ContestType) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    if (darkMode) {
      switch (status) {
        case 'active': return 'text-green-400 bg-green-900/30 border-green-700';
        case 'upcoming': return 'text-blue-400 bg-blue-900/30 border-blue-700';
        case 'ended': return 'text-gray-400 bg-gray-800 border-gray-600';
        default: return 'text-gray-400 bg-gray-800 border-gray-600';
      }
    } else {
      switch (status) {
        case 'active': return 'text-green-600 bg-green-100 border-green-200';
        case 'upcoming': return 'text-blue-600 bg-blue-100 border-blue-200';
        case 'ended': return 'text-gray-600 bg-gray-100 border-gray-200';
        default: return 'text-gray-600 bg-gray-100 border-gray-200';
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900' 
        : 'bg-gradient-to-br from-orange-50 via-white to-orange-100'
    }`}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Heading and Stats */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Master Your Programming Skills
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join competitive programming contests, solve challenging problems, and improve your coding abilities.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Cards for stats (same as before) */}
          {/* ... (no change here, omitted for brevity) */}
        </div>

        {/* Contests Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Available Contests
            </h3>
            <div className="flex items-center space-x-2">
              <Filter className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Contests</option>
                <option value="active">Running Contests</option>
                <option value="upcoming">Upcoming Contests</option>
                <option value="ended">Ended Contests</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => (
              <div
                key={contest._id}
                onClick={() => {
                  setselectContest({
                    ...contest,
                    _id: contest._id,
                    contesttitle: contest.contesttitle,
                    contestdesc: contest.contestdesc,
                  })
                  navigate('/contest')
                }}
                className={`rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-orange-500'
                    : 'bg-white border-gray-100 hover:border-orange-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(contest.status)}`}>
                      {contest.status}
                    </span>
                  </div>
                  <Trophy className={`h-5 w-5 transition-colors ${
                    darkMode 
                      ? 'text-gray-500 group-hover:text-orange-400' 
                      : 'text-gray-400 group-hover:text-orange-600'
                  }`} />
                </div>

                <h4 className={`text-lg font-semibold mb-2 transition-colors ${
                  darkMode
                    ? 'text-white group-hover:text-orange-400'
                    : 'text-gray-900 group-hover:text-orange-600'
                }`}>
                  {contest.contesttitle}
                </h4>
                <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {contest.contestdesc}
                </p>

                <div className="space-y-2">
                  <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatDate(contest.startTime)} - {formatDate(contest.endTime)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-600 font-medium">{contest.totalQuestions} problems</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
