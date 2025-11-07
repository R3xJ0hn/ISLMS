import { useEffect, useState } from "react";
import GradeNotesSection from "../components/GradeNotesSection";

interface GradesProps {
  token: string;
  user: { name: string; email: string };
  onLogout: () => void;
}

interface GradeItem {
  Label: string;
  Value: string;
}

interface StudentGrade {
  Subject: string;
  Grades: GradeItem[];
}

export default function Grades({ token, user, onLogout }: GradesProps) {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyMUVY_bvw7uthYKGtLOJJso2fjKx4PPanocvSVsM8VbSF1vddhiimzis4KhJ-aXrVRCA/exec";

  useEffect(() => {
    async function fetchGrades() {
      try {
        const res = await fetch(`${SCRIPT_URL}?action=getData&token=${token}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else if (data.Grades) {
          setGrades(data.Grades);
        } else if (Array.isArray(data)) {
          const student = data.find(
            (s) => s.Name?.toLowerCase() === user.name.toLowerCase()
          );
          if (student) setGrades(student.Grades);
          else setError("No grades found for your account");
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
  }, [token, user.name]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600">
        Loading grades...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-700 p-4 text-center">
        <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
        <button
          onClick={onLogout}
          className="rounded-lg bg-indigo-600 text-white px-5 py-2 text-sm sm:text-base font-medium hover:bg-indigo-700"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 sm:gap-0">
          <h1 className="text-lg sm:text-xl font-semibold text-slate-800 text-center sm:text-left">
            Welcome, {user.name}
          </h1>
          <button
            onClick={onLogout}
            className="text-sm text-indigo-600 hover:underline"
          >
            Logout
          </button>
        </div>

        <h2 className="text-base sm:text-lg font-medium text-slate-700 mb-4 text-center sm:text-left">
          Your Grades
        </h2>

        {/* Subject Grades */}
        {grades.map((subject, idx) => {
          const prelim =
            subject.Grades.find((g) => g.Label === "Prelim")?.Value || "";
          const midterm =
            subject.Grades.find((g) => g.Label === "Midterm")?.Value || "";
          const prefinal =
            subject.Grades.find((g) => g.Label === "Prefinals")?.Value || "";
          const finals =
            subject.Grades.find((g) => g.Label === "Finals")?.Value || "";
          const ave =
            subject.Grades.find((g) => g.Label === "Ave")?.Value || "";
          const remarks =
            subject.Grades.find((g) => g.Label === "Remarks")?.Value || "";
          const noteString =
            subject.Grades.find((g) => g.Label === "Note")?.Value || "";

          return (
            <div key={idx} className="mb-6">
              <div className="border border-slate-200 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 text-center sm:text-left">
                  {subject.Subject}
                </h3>

                {/* Responsive Layout */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Grades Table */}
                  <div className="w-full md:w-7/12">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-slate-300 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="py-2 text-center font-medium">Prelim</th>
                            <th className="py-2 text-center font-medium">Midterm</th>
                            <th className="py-2 text-center font-medium">Prefinals</th>
                            <th className="py-2 text-center font-medium">Finals</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-slate-700 bg-gradient-to-r from-slate-50 to-white hover:bg-slate-100 transition-all">
                            <td className="py-2 text-center border-t border-slate-100">
                              {prelim}
                            </td>
                            <td className="py-2 text-center border-t border-slate-100">
                              {midterm}
                            </td>
                            <td className="py-2 text-center border-t border-slate-100">
                              {prefinal}
                            </td>
                            <td className="py-2 text-center border-t border-slate-100">
                              {finals}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Grade Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 text-sm text-slate-700">
                      <p>
                        Final Grade:{" "}
                        <span className="font-semibold text-slate-800">
                          {ave || "—"}
                        </span>
                      </p>
                      <p className="sm:text-right mt-1 sm:mt-0">
                        Remarks:{" "}
                        <span
                          className={`font-semibold ${
                            remarks?.toLowerCase() === "passed"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {remarks || "—"}
                        </span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 italic mt-3 text-right">
                      *Grades are based on cumulative performance
                    </p>
                  </div>

                  {/* Notes Section */}
                  <div className="w-full md:w-5/12">
                    <GradeNotesSection notesData={noteString} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
