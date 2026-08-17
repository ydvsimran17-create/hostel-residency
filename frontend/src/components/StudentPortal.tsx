import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { CampusTreeIcon } from './CampusTreeIcon';
import { 
  Sparkles, 
  LogOut, 
  Home, 
  Users, 
  Wrench, 
  ClipboardList, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  PhoneCall
} from 'lucide-react';

export function StudentPortal() {
  const { 
    currentUser, 
    logoutUser, 
    students, 
    rooms, 
    maintenance, 
    messSupplies, 
    addMaintenanceRequest, 
    hostelName,
    contactEmail,
    contactPhone
  } = useAppState();

  // Maintenance form state
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'Electrical' | 'Plumbing' | 'Furniture' | 'Appliance' | 'Other'>('Electrical');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  if (!currentUser) return null;

  // Retrieve matching student object if registered
  const matchedStudent = students.find(
    (s) => s.studentId === currentUser.studentRollNumber
  );

  const roomNumber = matchedStudent?.roomNumber || null;
  const blockName = matchedStudent?.block || 'Unallotted Block';
  const myRoom = roomNumber ? rooms.find((r) => r.roomNumber === roomNumber) : null;
  
  // Find roommates
  const roommates = roomNumber
    ? students.filter((s) => s.roomNumber === roomNumber && s.studentId !== currentUser.studentRollNumber)
    : [];

  // Find maintenance requests raised for this room
  const myRoomTickets = roomNumber
    ? maintenance.filter((m) => m.roomNumber.toLowerCase() === roomNumber.toLowerCase())
    : [];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim()) return;

    addMaintenanceRequest({
      title: ticketTitle.trim(),
      roomNumber: roomNumber || 'General Student Lobby',
      category: ticketCategory,
      description: ticketDesc.trim(),
      priority: ticketPriority,
      raisedBy: currentUser.name,
    });

    setTicketTitle('');
    setTicketDesc('');
    setTicketPriority('Medium');
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
    }, 4000);
  };

  return (
    <div id="student-portal-layout" className="min-h-screen bg-warm-white text-charcoal font-sans antialiased">
      
      {/* Student Portal Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-ivory bg-white/95 px-4 shadow-xs backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-light bg-warm-white text-[#567A5E] font-bold">
            <CampusTreeIcon className="h-5 w-5 text-[#567A5E]" />
          </div>
          <div>
            <h1 className="font-serif text-sm md:text-base font-bold tracking-wide text-charcoal">
              {hostelName}
            </h1>
            <p className="font-mono text-[9px] tracking-wider text-blue-gray-medium uppercase font-bold">
              Student Resident Portal &bull; Live Connected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden flex-col text-right sm:flex">
            <span className="text-xs font-bold text-charcoal">{currentUser.name}</span>
            <span className="font-mono text-[9px] text-blue-gray-medium/80 uppercase font-semibold">
              Roll: {currentUser.studentRollNumber || 'Guest Student'}
            </span>
          </div>

          <button
            onClick={logoutUser}
            className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-ivory bg-warm-white px-3.5 py-1.5 text-xs font-semibold text-charcoal hover:bg-black hover:text-white transition"
          >
            <LogOut className="h-3.5 w-3.5 text-gold-accent" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Customized Elegant Dashboard Welcomer */}
        <div className="rounded-xl bg-charcoal p-6 md:p-8 text-white shadow-xs relative overflow-hidden border border-gold-light/10">
          <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-gold-accent/5 translate-x-12 translate-y-12 blur-2xl" />
          <div className="relative space-y-2.5">
            <div className="inline-block rounded-full bg-white/10 border border-white/15 px-3 py-0.5 text-[8px] font-bold tracking-widest uppercase text-gold-light">
              Authenticated Session
            </div>
            <h2 className="text-xl md:text-3xl font-serif tracking-wide text-white">Welcome Back, {currentUser.name}!</h2>
            <p className="max-w-2xl text-xs md:text-sm text-ivory/80 leading-relaxed font-light">
              We are delighted to host your residential journey. This portal serves as your hub to keep track of flatmates, check the cafeteria inventory levels, and submit direct maintenance work orders.
            </p>
          </div>
        </div>

        {/* Primary Resident Dashboard */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Block (Column 1 and 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Room Allotment Status Card */}
            <div className="rounded-xl border border-ivory bg-white p-5 md:p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-ivory pb-4 mb-4">
                <Home className="h-5 w-5 text-gold-accent" />
                <h3 className="font-serif text-base font-bold text-charcoal">Room Status Specifications</h3>
              </div>

              {roomNumber ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gold-light bg-gold-light/10 p-4 space-y-1">
                    <span className="block font-mono text-[8px] text-gold-accent uppercase font-bold tracking-wider">Allocated Suite</span>
                    <strong className="block text-2xl font-serif text-charcoal tracking-tight">{roomNumber}</strong>
                    <span className="block text-xs font-semibold text-blue-gray-medium">{blockName}</span>
                  </div>

                  <div className="rounded-lg border border-ivory bg-warm-white/55 p-4 space-y-2">
                    <span className="block font-mono text-[8px] text-blue-gray-medium uppercase font-bold tracking-wider">Bed Configuration</span>
                    {myRoom ? (
                      <div className="space-y-0.5">
                        <strong className="block text-xs font-bold text-charcoal">{myRoom.type} Standard Studio</strong>
                        <p className="text-[11px] text-[#6E7D91]">
                          {myRoom.occupied} of {myRoom.capacity} beds currently occupied.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#6E7D91]">Standard Double Suite dimensions.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-gold-light/10 border border-gold-accent/20 p-5 text-center space-y-2">
                  <AlertTriangle className="h-6 w-6 text-gold-accent mx-auto" />
                  <strong className="block text-sm font-bold text-charcoal">Suite Allotment Pending Approval</strong>
                  <p className="max-w-md mx-auto text-xs text-blue-gray-medium leading-relaxed">
                    You currently have no allotted bedroom. Our team is adjusting vacancy tables. Please write to <strong>{contactEmail}</strong> if you have already submitted your campus admissions slip.
                  </p>
                </div>
              )}
            </div>

            {/* Flatmates Log Card */}
            {roomNumber && (
              <div className="rounded-xl border border-ivory bg-white p-5 md:p-6 shadow-xs">
                <div className="flex items-center gap-2 border-b border-ivory pb-4 mb-4">
                  <Users className="h-5 w-5 text-gold-accent" />
                  <h3 className="font-serif text-base font-bold text-charcoal">Roommates Profiles ({roommates.length})</h3>
                </div>

                {roommates.length === 0 ? (
                  <p className="text-xs text-blue-gray-medium py-2 italic font-medium">You are currently the only allotted occupant of this room.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roommates.map((mate) => (
                      <div key={mate.id} className="rounded-lg border border-ivory p-3.5 bg-warm-white/45 flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-light/25 text-charcoal font-bold font-mono text-xs">
                          {mate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <strong className="block text-xs font-bold text-charcoal truncate">{mate.name}</strong>
                          <span className="block text-[9px] text-[#6E7D91] font-mono">{mate.studentId}</span>
                          <span className="block text-[10px] text-blue-gray-medium truncate">{mate.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Maintenance Form */}
            <div className="rounded-xl border border-ivory bg-white p-5 md:p-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-ivory pb-4 mb-4">
                <Wrench className="h-5 w-5 text-gold-accent" />
                <h3 className="font-serif text-base font-bold text-charcoal">Lodge Repair Ticket</h3>
              </div>

              {ticketSuccess && (
                <div className="mb-4 rounded-lg bg-gold-light/20 border border-gold-light/40 p-3.5 text-xs text-charcoal flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 text-gold-accent" />
                  <span>Success! Your maintenance request has been submitted to care staff. The work order id was generated.</span>
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-gray-medium uppercase tracking-wider mb-1">
                      Problem Short Title
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full rounded-lg border border-ivory bg-warm-white/45 px-3 py-2.5 text-xs text-charcoal focus:border-gold-accent/80 focus:outline-hidden"
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      placeholder="e.g. Toilet Flush Jammed, Bed frame lose"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-blue-gray-medium uppercase tracking-wider mb-1">
                      Category Type
                    </label>
                    <select
                      className="w-full rounded-lg border border-ivory bg-white px-2.5 py-2 text-xs text-charcoal focus:border-gold-accent/80 focus:outline-hidden"
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as any)}
                    >
                      <option value="Electrical">Electrical / Appliances</option>
                      <option value="Plumbing">Plumbing / Washroom</option>
                      <option value="Furniture">Furniture Repair</option>
                      <option value="Appliance">Pantry/Lobby Machinery</option>
                      <option value="Other">Other / Structural</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-blue-gray-medium uppercase tracking-wider mb-1">
                    Describe Room Fault Details
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-lg border border-ivory bg-warm-white/45 px-3 py-2 text-xs text-charcoal focus:border-gold-accent/80 focus:outline-hidden"
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    placeholder="Provide specific details to help workers identify tools. Please specify if urgent."
                  />
                </div>

                <div className="flex items-center justify-between border-t border-ivory pt-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#6E7D91] uppercase tracking-wider">Urgency:</span>
                    <div className="flex bg-warm-white rounded-lg p-0.5 border border-ivory">
                      {(['Low', 'Medium', 'High'] as const).map((pri) => (
                        <button
                          key={pri}
                          type="button"
                          onClick={() => setTicketPriority(pri)}
                          className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            ticketPriority === pri
                              ? 'bg-charcoal text-white shadow-xs'
                              : 'text-blue-gray-medium hover:text-charcoal hover:bg-white'
                          }`}
                        >
                          {pri}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="rounded-lg bg-charcoal px-4.5 py-2.5 text-xs font-bold text-white hover:bg-black transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="h-4 w-4 text-gold-accent" />
                    <span>File Ticket</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Column / Sidebar info */}
          <div className="space-y-6">
            
            {/* Live Progress on Raised Tickets */}
            <div className="rounded-xl border border-ivory bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-ivory pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-gold-accent" />
                  <h4 className="font-serif text-sm font-bold text-charcoal">My Suite Tickets</h4>
                </div>
                <span className="font-mono text-[9px] text-[#C9B07A] bg-gold-light/15 border border-gold-light/35 px-2 py-0.5 rounded-full font-bold">
                  {myRoomTickets.length} Raised
                </span>
              </div>

              {myRoomTickets.length === 0 ? (
                <div className="py-5 text-center text-xs text-blue-gray-medium italic space-y-1">
                  <CheckCircle className="h-5 w-5 text-gold-accent mx-auto opacity-70" />
                  <p>All clean! No active maintenance tickets registered for your bedroom Room.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {myRoomTickets.map((t) => (
                    <div key={t.id} className="rounded-lg border border-ivory p-3 bg-warm-white/45 space-y-2 hover:bg-warm-white transition">
                      <div className="flex items-start justify-between gap-2">
                        <strong className="block text-xs font-bold text-charcoal leading-tight min-w-0 truncate">{t.title}</strong>
                        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold font-mono uppercase tracking-wider ${
                          t.status === 'Completed'
                            ? 'bg-zinc-100 text-charcoal border border-ivory'
                            : t.status === 'In Progress'
                            ? 'bg-gold-light/20 text-charcoal border border-gold-light'
                            : 'bg-warm-white text-blue-gray-medium border border-ivory'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[11px] leading-snug text-blue-gray-medium/95 line-clamp-2">{t.description}</p>
                      
                      <div className="flex items-center justify-between text-[9px] font-mono text-blue-gray-medium/70 border-t border-ivory pt-1.5 flex-wrap gap-1">
                        <span>Worker: {t.assignedTo || 'Assigning...'}</span>
                        <span>Date: {t.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mess Pantry Status Indicator */}
            <div className="rounded-xl border border-ivory bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-ivory pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <ClipboardList className="h-4.5 w-4.5 text-gold-accent" />
                  <h4 className="font-serif text-sm font-bold text-charcoal">Mess Pantry Audit</h4>
                </div>
                <span className="font-sans text-[10px] text-charcoal font-bold bg-gold-light/15 border border-gold-light/40 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {messSupplies.slice(0, 5).map((sup) => (
                  <div key={sup.id} className="flex items-center justify-between py-1.5 border-b border-ivory/60 last:border-0 text-xs">
                    <span className="font-semibold text-charcoal truncate max-w-[150px]">{sup.name}</span>
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider font-bold border ${
                      sup.status === 'In Stock'
                        ? 'bg-white text-gold-accent border-gold-light/50'
                        : sup.status === 'Low Stock'
                        ? 'bg-white text-blue-gray-medium border-ivory'
                        : 'bg-white text-charcoal border-ivory'
                    }`}>
                      {sup.status === 'In Stock' ? 'Ready' : sup.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 bg-warm-white/75 rounded-lg p-3.5 border border-ivory">
                <span className="block font-mono text-[8px] font-bold text-gold-accent uppercase tracking-wider mb-0.5">Mess Board Announcement</span>
                <p className="text-[10px] leading-relaxed text-blue-gray-medium font-medium">
                  Daily menus are pinned on the cafeteria boards. For specific dietary allocations, consult supervision curators.
                </p>
              </div>
            </div>

            {/* Helpline Care Desk */}
            <div className="rounded-xl border border-ivory bg-white p-5 shadow-xs">
              <div className="flex items-center gap-1.5 border-b border-ivory pb-3 mb-3">
                <PhoneCall className="h-4.5 w-4.5 text-gold-accent" />
                <h4 className="font-serif text-sm font-bold text-charcoal">Contacts Desk</h4>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-blue-gray-medium font-medium">Hostel Care Desk:</span>
                  <strong className="font-mono text-charcoal font-bold">{contactPhone}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-gray-medium font-medium">Warden Curators:</span>
                  <strong className="font-mono text-[10px] text-charcoal font-bold">{contactEmail}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-gray-medium font-medium">Secondary Line:</span>
                  <strong className="font-mono text-gold-accent font-bold">Ext. 911</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
