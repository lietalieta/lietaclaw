"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";

type Agent = {
  _id: Id<"agents">;
  name: string;
  role: string;
  avatar: string;
  status: "working" | "idle" | "break" | "offline";
  currentTask?: string;
  deskId?: number;
  lastActive: number;
};

type Desk = {
  _id: Id<"desks">;
  id: number;
  x: number;
  y: number;
  agentId?: Id<"agents">;
  computerOn: boolean;
};

type Activity = {
  _id: Id<"activity">;
  agentId: Id<"agents">;
  action: string;
  description: string;
  timestamp: number;
};

const roleEmojis: Record<string, string> = {
  lead: "🦔",
  developer: "👨‍💻",
  writer: "✍️",
  designer: "🎨",
  researcher: "🔍",
};

const statusColors: Record<string, string> = {
  working: "bg-green-500",
  idle: "bg-yellow-500",
  break: "bg-blue-500",
  offline: "bg-gray-400",
};

const statusLabels: Record<string, string> = {
  working: "Working",
  idle: "Idle",
  break: "On Break",
  offline: "Offline",
};

export default function DigitalOffice() {
  const agents = useQuery(api.office.getAllAgents);
  const desks = useQuery(api.office.getAllDesks);
  const activity = useQuery(api.office.getRecentActivity, { limit: 10 });
  const initializeOffice = useMutation(api.office.initializeOffice);
  const updateAgentStatus = useMutation(api.office.updateAgentStatus);

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [view, setView] = useState<"office" | "list">("office");

  const handleInitialize = async () => {
    await initializeOffice({});
  };

  const handleStatusChange = async (agentId: Id<"agents">, status: Agent["status"]) => {
    await updateAgentStatus({ id: agentId, status });
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // This triggers a re-fetch
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (agents === undefined || desks === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-400">Loading office...</div>
      </div>
    );
  }

  const hasAgents = agents.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">🏢 Digital Office</h1>
            <p className="text-slate-400 mt-1">Your virtual workspace</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setView("office")}
                className={`px-4 py-2 rounded ${view === "office" ? "bg-slate-600 text-white" : "text-slate-400"}`}
              >
                Office
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-4 py-2 rounded ${view === "list" ? "bg-slate-600 text-white" : "text-slate-400"}`}
              >
                List
              </button>
            </div>
            {!hasAgents && (
              <button
                onClick={handleInitialize}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Initialize Office
              </button>
            )}
          </div>
        </div>

        {!hasAgents ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-xl font-semibold text-white mb-2">No office initialized</h2>
            <p className="text-slate-400 mb-6">Set up your virtual workspace</p>
            <button
              onClick={handleInitialize}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Initialize Office
            </button>
          </div>
        ) : view === "office" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Office View */}
            <div className="lg:col-span-3 bg-slate-800 rounded-2xl p-6 relative overflow-hidden" style={{ minHeight: "500px" }}>
              {/* Office background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 right-4 h-20 bg-slate-700 rounded-lg" />
                <div className="absolute bottom-4 left-4 right-4 h-32 bg-slate-700 rounded-lg" />
              </div>
              
              {/* Desks grid */}
              <div className="relative z-10" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {desks?.map((desk) => {
                  const agent = agents.find(a => a.deskId === desk.id);
                  return (
                    <div
                      key={desk.id}
                      className={`relative p-4 rounded-xl transition-all ${
                        agent?.status === "working" ? "bg-green-900/30 border-2 border-green-500" :
                        agent?.status === "idle" ? "bg-yellow-900/30 border-2 border-yellow-500" :
                        agent?.status === "break" ? "bg-blue-900/30 border-2 border-blue-500" :
                        "bg-slate-700/50 border-2 border-slate-600"
                      }`}
                      style={{ minHeight: "180px" }}
                    >
                      {/* Computer */}
                      <div className={`mx-auto w-16 h-12 rounded-lg mb-2 flex items-center justify-center ${
                        desk.computerOn ? "bg-green-500" : "bg-slate-600"
                      }`}>
                        <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center">
                          {desk.computerOn && <div className="w-8 h-4 bg-green-400/50 rounded animate-pulse" />}
                        </div>
                      </div>
                      
                      {/* Desk */}
                      <div className="w-full h-2 bg-slate-600 rounded mb-3" />
                      
                      {/* Agent */}
                      {agent ? (
                        <div 
                          className="text-center cursor-pointer"
                          onClick={() => setSelectedAgent(agent)}
                        >
                          <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl ${
                            statusColors[agent.status]
                          } ${agent.status === "working" ? "animate-bounce" : ""}`}>
                            {roleEmojis[agent.role] || "🤖"}
                          </div>
                          <div className="text-white font-medium mt-2 text-sm">{agent.name}</div>
                          <div className={`text-xs ${agent.status === "working" ? "text-green-400" : "text-slate-400"}`}>
                            {statusLabels[agent.status]}
                          </div>
                          {agent.currentTask && agent.status === "working" && (
                            <div className="text-xs text-slate-500 mt-1 truncate px-2">
                              {agent.currentTask}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-slate-500 text-sm">Empty desk</div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Working</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Idle</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500" /> Break</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-400" /> Offline</div>
              </div>
            </div>
            
            {/* Sidebar - Activity */}
            <div className="bg-slate-800 rounded-2xl p-4">
              <h3 className="font-semibold text-white mb-4">📋 Team Status</h3>
              <div className="space-y-3">
                {agents.map(agent => (
                  <div
                    key={agent._id}
                    onClick={() => setSelectedAgent(agent)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700 cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      statusColors[agent.status]
                    }`}>
                      {roleEmojis[agent.role] || "🤖"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{agent.name}</div>
                      <div className="text-xs text-slate-400">{agent.role}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(agent => (
              <div
                key={agent._id}
                onClick={() => setSelectedAgent(agent)}
                className="bg-slate-800 rounded-xl p-5 cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                    statusColors[agent.status]
                  }`}>
                    {roleEmojis[agent.role] || "🤖"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-slate-400 text-sm capitalize">{agent.role}</p>
                    <div className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${
                      statusColors[agent.status]
                    } text-white`}>
                      {statusLabels[agent.status]}
                    </div>
                  </div>
                </div>
                {agent.currentTask && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-400">Current task:</p>
                    <p className="text-sm text-white">{agent.currentTask}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Agent Detail Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                    statusColors[selectedAgent.status]
                  }`}>
                    {roleEmojis[selectedAgent.role] || "🤖"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
                    <p className="text-slate-400 capitalize">{selectedAgent.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mt-6">
                <label className="block text-sm text-slate-400 mb-2">Status</label>
                <div className="flex gap-2">
                  {(["working", "idle", "break", "offline"] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedAgent._id, status)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedAgent.status === status
                          ? `${statusColors[status]} text-white`
                          : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-2">Current Task</label>
                <input
                  type="text"
                  value={selectedAgent.currentTask || ""}
                  onChange={(e) => {
                    // Could add mutation to update task
                  }}
                  placeholder="What are they working on?"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 text-sm text-slate-400">
                Last active: {new Date(selectedAgent.lastActive).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
