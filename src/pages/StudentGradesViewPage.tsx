import { useEffect, useState } from "react";

interface GradesProps {
  token: string;
  user: { name: string; email: string };
  onLogout: () => void;
}

interface StudentGrade {
  Subject: string;
  Grades: { Label: string; Value: string }[];
}

export default function Grades({ token, user, onLogout }: GradesProps) {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyMUVY_bvw7uthYKGtLOJJso2fjKx4PPanocvSVsM8VbSF1vddhiimzis4KhJ-aXrVRCA/exec"; // replace with your script ID

  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch(`${SCRIPT_URL}?action=getData&token=${token}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          // Assuming the sheet returns all students, find the logged-in one
          const student = data.find(
            (s) => s.StudentName?.toLowerCase() === user.name.toLowerCase()
          );
          if (student) setGrades(student.Grades);
          else setError("No grades found for your account");
        } else if (data.Grades) {
          // If it directly returns the logged-in student
          setGrades(data.Grades);
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data. Try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600">
        Loading grades...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-700">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onLogout}
          className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-slate-800">Welcome, {user.name}</h1>
          <button
            onClick={onLogout}
            className="text-sm text-indigo-600 hover:underline"
          >
            Logout
          </button>
        </div>

        <h2 className="text-lg font-medium text-slate-700 mb-4">Your Grades Kay Major</h2>

        {grades.length > 0 ? (
          <div className="space-y-4">
            {grades.map((subject, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <h3 className="text-md font-semibold text-slate-800 mb-2">
                  {subject.Subject}
                </h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  {subject.Grades.map((g, i) => (
                    <li key={i} className="flex justify-between border-b border-slate-100 py-1">
                      <span>{g.Label}</span>
                      <span>{g.Value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No grades available.</p>
        )}
      </div>
    </div>
  );
}
