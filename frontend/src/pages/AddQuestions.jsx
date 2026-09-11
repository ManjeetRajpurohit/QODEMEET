import React, { useState } from "react";

const AddQuestions = () => {
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    category: "Arrays",
    description: "",
    constraints: "",
    examples: "",
    starterCode: "",
    visibleTestCases: "",
    hiddenTestCases: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // API Call Later
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Add New Question
        </h1>

        <p className="text-gray-400 mb-8">
          Create coding interview questions for candidates.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block mb-2 font-medium">
              Question Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter question title"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Difficulty + Category */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none"
              >
                <option>Arrays</option>
                <option>Strings</option>
                <option>Linked List</option>
                <option>Binary Search</option>
                <option>DP</option>
                <option>Graph</option>
                <option>Tree</option>
                <option>Heap</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium">
              Description
            </label>

            <textarea
              rows={6}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write the problem description..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Constraints */}
          <div>
            <label className="block mb-2 font-medium">
              Constraints
            </label>

            <textarea
              rows={4}
              name="constraints"
              value={formData.constraints}
              onChange={handleChange}
              placeholder="Enter constraints..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Examples */}
          <div>
            <label className="block mb-2 font-medium">
              Examples
            </label>

            <textarea
              rows={5}
              name="examples"
              value={formData.examples}
              onChange={handleChange}
              placeholder="Input / Output examples..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Starter Code */}
          <div>
            <label className="block mb-2 font-medium">
              Starter Code
            </label>

            <textarea
              rows={10}
              name="starterCode"
              value={formData.starterCode}
              onChange={handleChange}
              placeholder="Enter starter code..."
              className="w-full rounded-xl border border-white/10 bg-black/40 p-4 font-mono outline-none focus:border-indigo-500"
            />
          </div>

          {/* Test Cases */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">
                Visible Test Cases
              </label>

              <textarea
                rows={6}
                name="visibleTestCases"
                value={formData.visibleTestCases}
                onChange={handleChange}
                placeholder="Visible test cases..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Hidden Test Cases
              </label>

              <textarea
                rows={6}
                name="hiddenTestCases"
                value={formData.hiddenTestCases}
                onChange={handleChange}
                placeholder="Hidden test cases..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-8 py-4 font-semibold transition hover:bg-indigo-700"
          >
            Add Question
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestions;