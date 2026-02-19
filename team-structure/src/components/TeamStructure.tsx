"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

type Member = {
  _id: Id<"members">;
  _creationTime: number;
  name: string;
  role: "lead" | "developer" | "writer" | "designer" | "researcher" | "analyst" | "coordinator";
  type: "human" | "assistant" | "subagent";
  description: string;
  skills?: string[];
  avatar?: string;
  status: "active" | "inactive" | "busy";
  createdAt: number;
  updatedAt: number;
};

const roleConfig = {
  lead: { label: "👑 Lead", color: "bg-purple-500", icon: "👑" },
  developer: { label: "👨‍💻 Developer", color: "bg-blue-500", icon: "👨‍💻" },
  writer: { label: "✍️ Writer", color: "bg-green-500", icon: "✍️" },
  designer: { label: "🎨 Designer", color: "bg-pink-500", icon: "🎨" },
  researcher: { label: "🔍 Researcher", color: "bg-amber-500", icon: "🔍" },
  analyst: { label: "📊 Analyst", color: "bg-cyan-500", icon: "📊" },
  coordinator: { label: "📋 Coordinator", color: "bg-orange-500", icon: "📋" },
};

const roles = Object.keys(roleConfig) as Array<keyof typeof roleConfig>;

export default function TeamStructure() {
  const members = useQuery(api.team.getAllMembers);
  const createMember = useMutation(api.team.createMember);
  const updateMember = useMutation(api.team.updateMember);
  const deleteMember = useMutation(api.team.deleteMember);
  const initializeTeam = useMutation(api.team.initializeTeam);

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "developer" as Member["role"],
    type: "subagent" as Member["type"],
    description: "",
    skills: "",
  });

  const handleInitialize = async () => {
    await initializeTeam({});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    await createMember({
      name: newMember.name,
      role: newMember.role,
      type: newMember.type,
      description: newMember.description,
      skills: newMember.skills ? newMember.skills.split(",").map(s => s.trim()) : [],
    });

    setNewMember({ name: "", role: "developer", type: "subagent", description: "", skills: "" });
    setShowAddForm(false);
  };

  if (members === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading team...</div>
      </div>
    );
  }

  const filteredMembers = selectedRole 
    ? members.filter(m => m.role === selectedRole)
    : members;

  // Group by role for display
  const membersByRole = roles.reduce((acc, role) => {
    acc[role] = members.filter(m => m.role === role);
    return acc;
  }, {} as Record<string, Member[]>);

  const hasMembers = members.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">🏢 Team Structure</h1>
            <p className="text-slate-500 mt-1">Your AI team and subagents</p>
          </div>
          <div className="flex gap-2">
            {!hasMembers && (
              <button
                onClick={handleInitialize}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Initialize Team
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showAddForm ? "Cancel" : "+ Add Member"}
            </button>
          </div>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="mb-6 bg-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Name *</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Member name..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as Member["role"] })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{roleConfig[r].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Type</label>
                <select
                  value={newMember.type}
                  onChange={(e) => setNewMember({ ...newMember, type: e.target.value as Member["type"] })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="human">Human</option>
                  <option value="assistant">Assistant</option>
                  <option value="subagent">Subagent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-600">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newMember.skills}
                  onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                  placeholder="skill1, skill2, skill3"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-600">Description</label>
                <textarea
                  value={newMember.description}
                  onChange={(e) => setNewMember({ ...newMember, description: e.target.value })}
                  placeholder="What does this member do?"
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Member
                </button>
              </div>
            </div>
          </form>
        )}

        {!hasMembers ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No team members yet</h2>
            <p className="text-slate-500 mb-6">Initialize your team structure with predefined subagents</p>
            <button
              onClick={handleInitialize}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Initialize Team
            </button>
          </div>
        ) : (
          <>
            {/* Role filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedRole(null)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedRole === null
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                All ({members.length})
              </button>
              {roles.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedRole === role
                      ? roleConfig[role].color + " text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {roleConfig[role].label} ({membersByRole[role]?.length || 0})
                </button>
              ))}
            </div>

            {/* Team hierarchy visualization */}
            <div className="space-y-8">
              {/* Lead at top */}
              {membersByRole.lead && membersByRole.lead.length > 0 && (
                <div className="text-center">
                  <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wide">Leadership</h3>
                  <div className="flex justify-center gap-4">
                    {membersByRole.lead.map(member => (
                      <MemberCard key={member._id} member={member} onClick={() => setSelectedMember(member)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Main team grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.filter(m => m.role !== "lead").map(member => (
                  <MemberCard key={member._id} member={member} onClick={() => setSelectedMember(member)} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Member detail modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full ${roleConfig[selectedMember.role].color} flex items-center justify-center text-3xl`}>
                      {selectedMember.avatar || roleConfig[selectedMember.role].icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">{selectedMember.name}</h2>
                      <span className={`inline-block px-2 py-0.5 rounded text-sm ${
                        selectedMember.type === "human" ? "bg-green-100 text-green-700" :
                        selectedMember.type === "assistant" ? "bg-purple-100 text-purple-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {selectedMember.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm text-white ${roleConfig[selectedMember.role].color}`}>
                    {roleConfig[selectedMember.role].label}
                  </span>
                </div>

                <p className="mt-4 text-slate-600">{selectedMember.description}</p>

                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Skills</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedMember.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={() => {
                      deleteMember({ id: selectedMember._id });
                      setSelectedMember(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                  <span className="text-sm text-slate-400">
                    Added {new Date(selectedMember.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border border-slate-100"
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full ${roleConfig[member.role].color} flex items-center justify-center text-xl`}>
          {member.avatar || roleConfig[member.role].icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{member.name}</h3>
          <span className="text-sm text-slate-500">{roleConfig[member.role].label}</span>
        </div>
        <span className={`w-3 h-3 rounded-full ${
          member.status === "active" ? "bg-green-500" :
          member.status === "busy" ? "bg-yellow-500" :
          "bg-gray-400"
        }`} />
      </div>
      <p className="mt-3 text-sm text-slate-500 line-clamp-2">{member.description}</p>
      {member.skills && member.skills.length > 0 && (
        <div className="mt-3 flex gap-1 flex-wrap">
          {member.skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
              {skill}
            </span>
          ))}
          {member.skills.length > 3 && (
            <span className="text-xs text-slate-400">+{member.skills.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
