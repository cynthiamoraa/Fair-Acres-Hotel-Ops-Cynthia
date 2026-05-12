import { useState, useEffect } from 'react';
import { getTickets, updateTicket, getRoomStatuses, updateRoomStatus, getDashboardStats } from '../services/api';

export default function TicketDashboard() {
  const [tickets, setTickets] = useState([]);
  const [roomStatuses, setRoomStatuses] = useState({});
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('tickets');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [ticketsData, roomsData, statsData] = await Promise.all([
        getTickets(),
        getRoomStatuses(),
        getDashboardStats()
      ]);
      setTickets(ticketsData);
      setRoomStatuses(roomsData);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      await updateTicket(ticketId, { status: 'resolved' });
      loadData();
    } catch (error) {
      console.error('Error resolving ticket:', error);
    }
  };

  const handleSetDND = async (room, hours = 2) => {
    try {
      await updateRoomStatus(room, { status: 'dnd', dndHours: hours });
      loadData();
      alert(`Room ${room} set to DND for ${hours} hours`);
    } catch (error) {
      console.error('Error setting DND:', error);
    }
  };

  const handleReleaseDND = async (room) => {
    try {
      await updateRoomStatus(room, { status: 'available' });
      loadData();
    } catch (error) {
      console.error('Error releasing DND:', error);
    }
  };

  const handleAssignTicket = async (ticketId) => {
    const staffList = ['Grace (HK)', 'John (HK)', 'Paul (Maint.)', 'Faith (HK)'];
    const staff = staffList[Math.floor(Math.random() * staffList.length)];
    
    try {
      await updateTicket(ticketId, { assignedTo: staff });
      loadData();
      alert(`Ticket assigned to ${staff}`);
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}hr ${minutes % 60}min ago`;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'border-l-red-500 bg-red-50',
      normal: 'border-l-amber-500 bg-amber-50',
      low: 'border-l-gray-400 bg-gray-50'
    };
    return colors[priority] || colors.normal;
  };

  const getStatusBadge = (status, priority) => {
    if (status === 'resolved') return 'bg-green-100 text-green-800';
    if (status === 'dnd') return 'bg-gray-100 text-gray-800';
    if (priority === 'urgent') return 'bg-red-100 text-red-800';
    return 'bg-amber-100 text-amber-800';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaint Ticketing System</h1>
        <p className="text-gray-600">Manage guest complaints and room status</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{stats.openTickets || 0}</div>
          <div className="text-sm text-gray-600">Open Tickets</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-amber-600">{stats.dndRooms || 0}</div>
          <div className="text-sm text-gray-600">Rooms on DND</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.resolvedToday || 0}</div>
          <div className="text-sm text-gray-600">Resolved Today</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.avgResolutionTime || '0m'}</div>
          <div className="text-sm text-gray-600">Avg Resolution</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-6 py-2 rounded-full font-medium transition ${
            activeTab === 'tickets'
              ? 'bg-[#7D2640] text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Complaint Tickets
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-6 py-2 rounded-full font-medium transition ${
            activeTab === 'rooms'
              ? 'bg-[#7D2640] text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Room Status + DND
        </button>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              All tickets resolved for now ✓
            </div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${getPriorityColor(ticket.priority)} ${
                  ticket.status === 'resolved' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-gray-500">{ticket.id}</span>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(ticket.status, ticket.priority)}`}>
                      {ticket.priority === 'urgent' ? 'URGENT' : ticket.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Room {ticket.room}
                    </span>
                  </div>
                  <span className={`text-sm ${ticket.priority === 'urgent' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {getTimeAgo(ticket.submittedAt)}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{ticket.title}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {ticket.category} · Submitted by {ticket.submittedBy}
                  {ticket.assignedTo && ` · Assigned to ${ticket.assignedTo}`}
                </p>

                {ticket.status !== 'resolved' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveTicket(ticket.id)}
                      className="px-4 py-2 bg-[#7D2640] text-white rounded-lg text-sm font-medium hover:bg-[#5a1a2f] transition"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleSetDND(ticket.room)}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                    >
                      Set Room {ticket.room} DND
                    </button>
                    <button
                      onClick={() => handleAssignTicket(ticket.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Assign to Staff
                    </button>
                  </div>
                )}

                {ticket.status === 'resolved' && (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ Resolved at {new Date(ticket.resolvedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div>
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>DND — Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Maintenance</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {Object.entries(roomStatuses).map(([room, { status, dndUntil }]) => (
              <div
                key={room}
                className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition cursor-pointer relative"
              >
                <div
                  className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                    status === 'available'
                      ? 'bg-green-500'
                      : status === 'dnd'
                      ? 'bg-red-500'
                      : status === 'occupied'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                ></div>
                <div className="text-xl font-semibold text-gray-900 mb-1">
                  {room}
                </div>
                <div className="text-xs text-gray-500 mb-2">Floor {room[0]}</div>
                <div
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : status === 'dnd'
                      ? 'bg-red-100 text-red-800'
                      : status === 'occupied'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {status.toUpperCase()}
                </div>
                {status === 'dnd' && dndUntil && (
                  <button
                    onClick={() => handleReleaseDND(room)}
                    className="mt-2 w-full px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                  >
                    Release DND
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}