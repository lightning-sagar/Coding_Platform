import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type RankingUser = {
  _id: string;
  username: string;
  score: number;
  totalTimeTaken: number;
};

const RankingPage = ({ darkMode }: { darkMode: boolean }) => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
    const { cid } = useParams();
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/contest/rankings/${cid}`,{
          credentials: "include",
          method:"GET"
        });
        const data = await res.json();
        setRankings(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rankings", err);
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div
      className={`min-h-screen px-4 py-8 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">🏆 Rankings</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border px-4 py-2">Rank</th>
                <th className="border px-4 py-2">Username</th>
                <th className="border px-4 py-2">Score</th>
                <th className="border px-4 py-2">Time Taken (ms)</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((user, idx) => (
                <tr key={user._id} className="text-center">
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2">{user.score}</td>
                  <td className="border px-4 py-2">{user.totalTimeTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RankingPage;
