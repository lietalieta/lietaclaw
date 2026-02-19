"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

type Content = {
  _id: Id<"content">;
  _creationTime: number;
  title: string;
  stage: "idea" | "research" | "writing" | "review" | "scheduled" | "published";
  idea?: string;
  script?: string;
  images?: string[];
  platform?: string;
  assignee: "user" | "assistant";
  createdAt: number;
  updatedAt: number;
};

const stageColumns = [
  { key: "idea", label: "💡 Ideas", color: "bg-purple-100" },
  { key: "research", label: "🔍 Research", color: "bg-blue-100" },
  { key: "writing", label: "✍️ Writing", color: "bg-yellow-100" },
  { key: "review", label: "👀 Review", color: "bg-orange-100" },
  { key: "scheduled", label: "📅 Scheduled", color: "bg-cyan-100" },
  { key: "published", label: "✅ Published", color: "bg-green-100" },
] as const;

const platforms = [
  { value: "", label: "No platform" },
  { value: "twitter", label: "Twitter/X" },
  { value: "youtube", label: "YouTube" },
  { value: "blog", label: "Blog" },
  { value: "discord", label: "Discord" },
  { value: "linkedin", label: "LinkedIn" },
];

export default function ContentPipeline() {
  const content = useQuery(api.content.getAllContent);
  const createContent = useMutation(api.content.createContent);
  const updateStage = useMutation(api.content.updateStage);
  const updateContent = useMutation(api.content.updateContent);
  const deleteContent = useMutation(api.content.deleteContent);
  const addImage = useMutation(api.content.addImage);
  const removeImage = useMutation(api.content.removeImage);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    idea: "",
    script: "",
    platform: "",
    assignee: "user" as "user" | "assistant",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    await createContent({
      title: newItem.title,
      idea: newItem.idea || undefined,
      script: newItem.script || undefined,
      platform: newItem.platform || undefined,
      assignee: newItem.assignee,
    });

    setNewItem({ title: "", idea: "", script: "", platform: "", assignee: "user" });
    setShowAddForm(false);
  };

  const getContentByStage = (stage: string) => {
    return content?.filter((c) => c.stage === stage) || [];
  };

  if (content === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-[98%] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🎬 Content Pipeline</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showAddForm ? "Cancel" : "+ New Content"}
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="mb-6 bg-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Title *</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Content title..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Platform</label>
                <select
                  value={newItem.platform}
                  onChange={(e) => setNewItem({ ...newItem, platform: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {platforms.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-600">Initial Idea</label>
                <textarea
                  value={newItem.idea}
                  onChange={(e) => setNewItem({ ...newItem, idea: e.target.value })}
                  placeholder="What's the core concept?"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Assign to</label>
                <select
                  value={newItem.assignee}
                  onChange={(e) => setNewItem({ ...newItem, assignee: e.target.value as "user" | "assistant" })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="user">👤 Me</option>
                  <option value="assistant">🤖 Assistant</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Pipeline columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto">
          {stageColumns.map((stage) => (
            <div key={stage.key} className={`${stage.color} rounded-xl p-3 min-h-[250px]`}>
              <h2 className="font-semibold text-sm mb-3 flex items-center justify-between text-gray-700">
                {stage.label}
                <span className="bg-white/60 px-2 py-0.5 rounded-full text-xs">
                  {getContentByStage(stage.key).length}
                </span>
              </h2>

              <div className="space-y-2">
                {getContentByStage(stage.key).map((item) => (
                  <ContentCard
                    key={item._id}
                    item={item}
                    isEditing={editingItem === item._id}
                    onEdit={() => setEditingItem(editingItem === item._id ? null : item._id)}
                    onStageChange={updateStage}
                    onContentUpdate={updateContent}
                    onDelete={deleteContent}
                    onAddImage={addImage}
                    onRemoveImage={removeImage}
                  />
                ))}
                {getContentByStage(stage.key).length === 0 && (
                  <div className="text-center text-gray-400 py-4 text-xs">
                    No content
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentCard({
  item,
  isEditing,
  onEdit,
  onStageChange,
  onContentUpdate,
  onDelete,
  onAddImage,
  onRemoveImage,
}: {
  item: Content;
  isEditing: boolean;
  onEdit: () => void;
  onStageChange: any;
  onContentUpdate: any;
  onDelete: any;
  onAddImage: any;
  onRemoveImage: any;
}) {
  const [editData, setEditData] = useState({
    title: item.title,
    idea: item.idea || "",
    script: item.script || "",
    platform: item.platform || "",
  });
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleSave = () => {
    onContentUpdate({
      id: item._id,
      title: editData.title,
      idea: editData.idea || undefined,
      script: editData.script || undefined,
      platform: editData.platform || undefined,
    });
    onEdit();
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      onAddImage({ id: item._id, imageUrl: newImageUrl.trim() });
      setNewImageUrl("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 text-sm transition-all hover:shadow-md">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full px-2 py-1 border rounded text-sm font-medium"
          />
          <textarea
            value={editData.idea}
            onChange={(e) => setEditData({ ...editData, idea: e.target.value })}
            placeholder="Idea..."
            rows={2}
            className="w-full px-2 py-1 border rounded text-xs"
          />
          <textarea
            value={editData.script}
            onChange={(e) => setEditData({ ...editData, script: e.target.value })}
            placeholder="Full script..."
            rows={4}
            className="w-full px-2 py-1 border rounded text-xs"
          />
          <select
            value={editData.platform}
            onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
            className="w-full px-2 py-1 border rounded text-xs"
          >
            {platforms.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <div className="flex gap-1">
            <button onClick={handleSave} className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs">Save</button>
            <button onClick={onEdit} className="flex-1 px-2 py-1 bg-gray-300 rounded text-xs">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium text-gray-800 text-xs leading-tight pr-1">{item.title}</h3>
            <div className="flex gap-1">
              <button onClick={onEdit} className="text-gray-400 hover:text-purple-500">✏️</button>
              <button
                onClick={() => {
                  if (confirm("Delete this content?")) onDelete({ id: item._id });
                }}
                className="text-gray-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          </div>

          {item.platform && (
            <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-500 mb-1">
              {platforms.find(p => p.value === item.platform)?.label}
            </span>
          )}

          {item.idea && (
            <p className="text-xs text-gray-500 mb-1 line-clamp-2">{item.idea}</p>
          )}

          {item.script && (
            <p className="text-xs text-blue-600 mb-1">📝 Has script ({item.script.length} chars)</p>
          )}

          {item.images && item.images.length > 0 && (
            <div className="mb-1">
              <p className="text-xs text-gray-500">🖼️ {item.images.length} image(s)</p>
              <div className="flex gap-1 flex-wrap mt-1">
                {item.images.slice(0, 3).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-8 h-8 object-cover rounded" />
                ))}
              </div>
            </div>
          )}

          {/* Add image input */}
          <div className="mt-1 flex gap-1">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Add image URL..."
              className="flex-1 px-1 py-0.5 border rounded text-xs"
            />
            <button onClick={handleAddImage} className="text-xs bg-gray-100 px-1 rounded">+</button>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <select
              value={item.assignee}
              onChange={(e) => onContentUpdate({ id: item._id, assignee: e.target.value })}
              className={`text-xs rounded px-1 ${
                item.assignee === "user" ? "text-blue-600 bg-blue-50" : "text-pink-600 bg-pink-50"
              }`}
            >
              <option value="user">👤 Me</option>
              <option value="assistant">🤖 Assistant</option>
            </select>

            <select
              value={item.stage}
              onChange={(e) => onStageChange({ id: item._id, stage: e.target.value })}
              className="text-xs border-0 bg-transparent cursor-pointer"
            >
              {stageColumns.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
