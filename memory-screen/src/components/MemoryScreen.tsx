"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";

type Memory = {
  _id: Id<"memories">;
  _creationTime: number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  source?: string;
  createdAt: number;
  updatedAt: number;
};

const categories = [
  { value: "", label: "All" },
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
  { value: "learning", label: "Learning" },
  { value: "goals", label: "Goals" },
  { value: "preferences", label: "Preferences" },
  { value: "relationships", label: "Relationships" },
  { value: "other", label: "Other" },
];

export default function MemoryScreen() {
  const memories = useQuery(api.memories.getAllMemories);
  const createMemory = useMutation(api.memories.createMemory);
  const updateMemory = useMutation(api.memories.updateMemory);
  const deleteMemory = useMutation(api.memories.deleteMemory);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: "",
    content: "",
    category: "personal",
    tags: "",
  });

  const displayMemories = memories;
  const filteredMemories = selectedCategory 
    ? displayMemories?.filter(m => m.category === selectedCategory)
    : displayMemories;

  // Filter by search query in memory
  const searchedMemories = searchQuery
    ? filteredMemories?.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : filteredMemories;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.title.trim()) return;

    await createMemory({
      title: newMemory.title,
      content: newMemory.content,
      category: newMemory.category,
      tags: newMemory.tags ? newMemory.tags.split(",").map(t => t.trim()) : [],
      source: "manual",
    });

    setNewMemory({ title: "", content: "", category: "personal", tags: "" });
    setShowAddForm(false);
  };

  // Import from workspace memories
  const importFromWorkspace = async () => {
    // Read from workspace memory files
    const memoryFiles = ["/Users/lieta/.openclaw/workspace/MEMORY.md"];
    
    for (const file of memoryFiles) {
      try {
        const response = await fetch(`file://${file}`);
        const text = await response.text();
        // Parse and import memories
        console.log("Would import from:", file);
      } catch (e) {
        console.log("Could not read", file);
      }
    }
  };

  if (displayMemories === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800">🧠 Memory</h1>
          <div className="flex gap-2">
            <button
              onClick={importFromWorkspace}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              Import
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {showAddForm ? "Cancel" : "+ New"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search memories... (type to search)"
              className="w-full px-4 py-3 pl-12 bg-white rounded-xl shadow-sm border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="mb-6 bg-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Title *</label>
                <input
                  type="text"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                  placeholder="Memory title..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Category</label>
                <select
                  value={newMemory.category}
                  onChange={(e) => setNewMemory({ ...newMemory, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  {categories.filter(c => c.value).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-600">Content</label>
                <textarea
                  value={newMemory.content}
                  onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                  placeholder="Write your memory..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newMemory.tags}
                  onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? "bg-purple-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Memory grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchedMemories?.map(memory => (
            <div
              key={memory._id}
              onClick={() => setSelectedMemory(memory)}
              className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border border-slate-100"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800 line-clamp-1">{memory.title}</h3>
                {memory.category && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    memory.category === "personal" ? "bg-pink-100 text-pink-700" :
                    memory.category === "work" ? "bg-blue-100 text-blue-700" :
                    memory.category === "learning" ? "bg-green-100 text-green-700" :
                    memory.category === "goals" ? "bg-purple-100 text-purple-700" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {memory.category}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 line-clamp-3 mb-3">
                {memory.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {memory.tags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(memory.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {searchedMemories?.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-4">🧠</div>
            <p>No memories found</p>
            <p className="text-sm">Create your first memory or try a different search</p>
          </div>
        )}

        {/* Memory detail modal */}
        {selectedMemory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedMemory.title}</h2>
                    <div className="flex gap-2 mt-2">
                      {selectedMemory.category && (
                        <span className="text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {selectedMemory.category}
                        </span>
                      )}
                      {selectedMemory.source && (
                        <span className="text-sm text-slate-400">{selectedMemory.source}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMemory(null)}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap text-slate-600">{selectedMemory.content}</p>
                </div>
                {selectedMemory.tags && selectedMemory.tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex gap-2 flex-wrap">
                      {selectedMemory.tags.map((tag, i) => (
                        <span key={i} className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => {
                    deleteMemory({ id: selectedMemory._id });
                    setSelectedMemory(null);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
                <div className="text-sm text-slate-400">
                  Created {new Date(selectedMemory.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
