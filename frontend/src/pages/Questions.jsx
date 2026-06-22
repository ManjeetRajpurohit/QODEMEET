import React, { useContext, useEffect, useState } from "react";
import {
  Search,
  PlusCircle,
  Eye,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";
import axios from "axios";

const Questions = () => {
  const { navigate } = useContext(AppContext);

  const [questions, setQuestions] = useState([]);

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = [
    "All",
    ...new Set(questions.map((q) => q.category)),
  ];

  const handleDelete = (id) => {
    setQuestions((prev) =>
      prev.filter((question) => question._id !== id)
    );
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "All" ||
      question.difficulty === difficultyFilter;

    const matchesCategory =
      categoryFilter === "All" ||
      question.category === categoryFilter;

    return (
      matchesSearch &&
      matchesDifficulty &&
      matchesCategory
    );
  });

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return (
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
            Easy
          </span>
        );

      case "Medium":
        return (
          <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
            Medium
          </span>
        );

      case "Hard":
        return (
          <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
            Hard
          </span>
        );

      default:
        return null;
    }
  };
  const fetchQuestion=async()=>{
         try{
            const response=await axios.get(import.meta.env.VITE_BACKEND_URL+"/api/question");
            if(response.data.success){
              setQuestions(response.data.questions);
            }
         }
         catch(error){
          toast.error(error);
         }
  }
  useEffect(()=>{
    fetchQuestion();
  },[])
  return (
    <div className="min-h-screen bg-[#050816] p-6 text-white">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="mt-1 text-gray-400">
            Manage interview questions
          </p>
        </div>

        <button onClick={()=>navigate('/dashboard/addquestion')} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium transition hover:bg-indigo-700">
          <PlusCircle size={18} />
          Add Question
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Total Questions</p>
          <h2 className="mt-2 text-3xl font-bold">
            {questions.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Easy</p>
          <h2 className="mt-2 text-3xl font-bold text-green-400">
            {questions.filter((q) => q.difficulty === "Easy").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Medium</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-400">
            {questions.filter((q) => q.difficulty === "Medium").length}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Hard</p>
          <h2 className="mt-2 text-3xl font-bold text-red-400">
            {questions.filter((q) => q.difficulty === "Hard").length}
          </h2>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none transition focus:border-indigo-500"
          />
        </div>

        <select
          value={difficultyFilter}
          onChange={(e) =>
            setDifficultyFilter(e.target.value)
          }
          className="min-w-[180px] rounded-xl border border-white/10 bg-slate-900 text-white px-4 py-3 outline-none focus:border-indigo-500"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
          className="min-w-[180px] rounded-xl border border-white/10 bg-slate-900 text-white px-4 py-3 outline-none focus:border-indigo-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "All"
                ? "All Categories"
                : category}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left">Title</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-left">Difficulty</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredQuestions.map((question) => (
              <tr
                key={question._id}
                className="border-b border-white/10 transition hover:bg-white/5"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <FileText
                      size={18}
                      className="text-indigo-400"
                    />
                    {question.title}
                  </div>
                </td>

                <td className="px-6 py-5 text-gray-300">
                  {question.category}
                </td>

                <td className="px-6 py-5">
                  {getDifficultyBadge(question.difficulty)}
                </td>

                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/questions/${question._id}`)
                      }
                      className="rounded-lg bg-indigo-600 p-2 transition hover:bg-indigo-700"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(question._id)
                      }
                      className="rounded-lg bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredQuestions.length === 0 && (
          <div className="py-16 text-center">
            <FileText
              size={50}
              className="mx-auto mb-4 text-gray-500"
            />
            <h3 className="text-lg font-semibold">
              No Questions Found
            </h3>
            <p className="mt-2 text-gray-400">
              Try changing your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;