"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

type Event = {
  _id: Id<"events">;
  _creationTime: number;
  title: string;
  description?: string;
  startTime: number;
  endTime?: number;
  allDay: boolean;
  recurring?: boolean;
  recurrenceRule?: string;
  type: "task" | "cron" | "reminder" | "meeting" | "other";
  status: "scheduled" | "completed" | "cancelled";
  assignee: "user" | "assistant" | "both";
  createdAt: number;
  updatedAt: number;
};

const eventTypes = [
  { value: "task", label: "📋 Task", color: "bg-blue-500" },
  { value: "cron", label: "⏰ Cron", color: "bg-purple-500" },
  { value: "reminder", label: "🔔 Reminder", color: "bg-yellow-500" },
  { value: "meeting", label: "📅 Meeting", color: "bg-green-500" },
  { value: "other", label: "📌 Other", color: "bg-gray-500" },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const events = useQuery(api.events.getAllEvents);
  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const completeEvent = useMutation(api.events.completeEvent);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    allDay: false,
    type: "task" as Event["type"],
    assignee: "both" as Event["assignee"],
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day: number) => {
    if (!events) return [];
    const dayStart = new Date(year, month, day).setHours(0, 0, 0, 0);
    const dayEnd = new Date(year, month, day).setHours(23, 59, 59, 999);
    return events.filter(e => e.startTime >= dayStart && e.startTime <= dayEnd);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.startDate) return;

    const startTime = new Date(`${newEvent.startDate}T${newEvent.allDay ? "00:00" : newEvent.startTime}`).getTime();
    const endTime = newEvent.endDate 
      ? new Date(`${newEvent.endDate}T${newEvent.allDay ? "23:59" : newEvent.endTime}`).getTime()
      : undefined;

    await createEvent({
      title: newEvent.title,
      description: newEvent.description || undefined,
      startTime,
      endTime,
      allDay: newEvent.allDay,
      type: newEvent.type,
      assignee: newEvent.assignee,
    });

    setNewEvent({
      title: "",
      description: "",
      startDate: "",
      startTime: "09:00",
      endDate: "",
      endTime: "10:00",
      allDay: false,
      type: "task",
      assignee: "both",
    });
    setShowAddForm(false);
  };

  if (events === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  const today = new Date();
  const upcomingEvents = events
    .filter(e => e.startTime >= Date.now() && e.status === "scheduled")
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📅 Calendar</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add Event"}
          </button>
        </div>

        {/* Add event form */}
        {showAddForm && (
          <form onSubmit={handleCreateEvent} className="mb-6 bg-white rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Date *</label>
                <input
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event["type"] })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {eventTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">Assign to</label>
                <select
                  value={newEvent.assignee}
                  onChange={(e) => setNewEvent({ ...newEvent, assignee: e.target.value as Event["assignee"] })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="both">Both</option>
                  <option value="user">Me</option>
                  <option value="assistant">Assistant</option>
                </select>
              </div>
              {!newEvent.allDay && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Start Time</label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">End Time</label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allDay"
                  checked={newEvent.allDay}
                  onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="allDay" className="text-sm text-gray-600">All day</label>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
              <h2 className="text-xl font-semibold">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
            </div>
            <button onClick={goToToday} className="text-sm text-blue-600 hover:underline mb-2">Go to today</button>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Previous month days */}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`prev-${i}`} className="min-h-[80px] p-1 bg-gray-50 rounded text-gray-400 text-xs">
                  {daysInPrevMonth - firstDayOfMonth + i + 1}
                </div>
              ))}

              {/* Current month days */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                const dayEvents = getEventsForDay(day);

                return (
                  <div key={day} className={`min-h-[80px] p-1 border rounded ${isToday ? "bg-blue-50 border-blue-300" : "bg-white"}`}>
                    <div className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-700"}`}>{day}</div>
                    <div className="space-y-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event._id}
                          className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${
                            event.status === "completed" ? "line-through opacity-50" : ""
                          } ${event.type === "cron" ? "bg-purple-100 text-purple-700" : 
                             event.type === "task" ? "bg-blue-100 text-blue-700" :
                             event.type === "reminder" ? "bg-yellow-100 text-yellow-700" :
                             "bg-gray-100 text-gray-700"}`}
                          title={event.title}
                          onClick={() => {
                            if (confirm(`${event.title}\n${event.status === "scheduled" ? "Mark as completed?" : ""}`)) {
                              completeEvent({ id: event._id });
                            }
                          }}
                        >
                          {event.allDay ? "📌" : new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar - upcoming events */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-4">📌 Upcoming</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event._id} className="border-l-4 border-blue-500 pl-3">
                    <div className="text-sm font-medium">{event.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <span className={`text-xs px-1 rounded ${
                        event.assignee === "user" ? "bg-blue-100" : 
                        event.assignee === "assistant" ? "bg-pink-100" : "bg-purple-100"
                      }`}>
                        {event.assignee === "user" ? "👤" : event.assignee === "assistant" ? "🤖" : "👥"}
                      </span>
                      <button
                        onClick={() => deleteEvent({ id: event._id })}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
