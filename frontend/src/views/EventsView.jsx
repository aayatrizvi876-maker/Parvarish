import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, MapPin, Clock, Building, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function EventsView({ onCreateEventClick }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await api.getEvents(filter === 'ALL' ? null : filter);
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex-1 bg-slate-100 min-h-screen p-4 pb-16 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar size={22} className="text-emerald-700" />
          <h2 className="font-serif-title text-xl font-bold text-slate-900">Department Events</h2>
        </div>

        {isAdmin && (
          <button
            onClick={onCreateEventClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1 shadow"
          >
            <Plus size={14} />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 mb-4 text-xs font-medium">
        {['ALL', 'UPCOMING', 'COMPLETED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              filter === f ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {f === 'ALL' ? 'All Events' : f}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading departmental calendar...</div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            No events listed under this filter.
          </div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              {evt.imageUrl && (
                <img src={evt.imageUrl} alt={evt.title} className="w-full h-36 object-cover" />
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    evt.status === 'UPCOMING' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}>
                    {evt.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{evt.eventDate}</span>
                </div>

                <h3 className="font-serif-title font-bold text-base text-slate-900">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {evt.description}
                </p>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <Clock size={13} className="text-slate-400" />
                    <span>Time: {evt.eventTime}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>Venue: {evt.venue}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Building size={13} className="text-slate-400" />
                    <span>Organizer: {evt.organizer}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
