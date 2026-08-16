import React, { useState } from "react"

type AuthStage = "welcome" | "login" | "signup" | "forgot"
type Screen = "home" | "ai" | "messages" | "bookings" | "profile"
type Mode = "client" | "provider"

type NavView =
  | { kind: "tab"; screen: Screen }
  | { kind: "providerProfile"; id: number }
  | { kind: "dm"; id: number }
  | { kind: "search"; query: string }
  | { kind: "bookingFlow"; providerId: number }
  | { kind: "verification" }

interface ChatMessage {
  role: "user" | "ai"
  text: string
  hasProviders?: boolean
}

interface DMMessage {
  from: "me" | "them"
  text: string
  time: string
}

const PROVIDERS = [
  { id: 1, initials: "AG", color: "#7EC8E3", name: "Abebe Girma", headline: "Senior Plumber & Pipe Specialist", rating: 4.9, reviews: 42, distance: "1.8 km", price: "300 ETB/hr", verified: true, match: 96, jobs: 85, response: "~5 min", about: "Licensed plumber with 8 years of experience across residential and commercial properties in Addis. Specializes in leak detection, pipe installations, and emergency repairs. Fast, clean, and reliable.", services: [{ name: "Leak Detection & Repair", tags: ["Emergency", "Same-day"], duration: "1–3 hrs", price: "300 ETB/hr", fixed: false }, { name: "Full Pipe Installation", tags: ["Residential", "Commercial"], duration: "Half day", price: "1,500 ETB", fixed: true }, { name: "Bathroom Fitting", tags: ["Renovation"], duration: "1–2 days", price: "From 3,000 ETB", fixed: true }] },
  { id: 2, initials: "SM", color: "#0891B2", name: "Sara Mekonnen", headline: "House Cleaning Pro", rating: 4.8, reviews: 67, distance: "0.9 km", price: "250 ETB/hr", verified: true, match: 91, jobs: 120, response: "~8 min", about: "Professional cleaner offering deep-cleaning, post-construction cleaning, and regular maintenance packages. Uses eco-friendly products. Trusted by over 120 families in Bole and CMC area.", services: [{ name: "Standard Home Cleaning", tags: ["Weekly", "Bi-weekly"], duration: "2–4 hrs", price: "250 ETB/hr", fixed: false }, { name: "Deep Cleaning", tags: ["One-time"], duration: "Full day", price: "1,800 ETB", fixed: true }, { name: "Move-in / Move-out", tags: ["Post-construction"], duration: "Full day", price: "2,500 ETB", fixed: true }] },
  { id: 3, initials: "DT", color: "#059669", name: "Dawit Tadesse", headline: "IT Support & Repair", rating: 4.7, reviews: 38, distance: "3.1 km", price: "400 ETB/hr", verified: true, match: 88, jobs: 64, response: "~12 min", about: "IT technician specializing in laptop/PC repairs, networking, and software troubleshooting. Worked with 50+ businesses in Addis. Offers remote support and on-site visits.", services: [{ name: "Laptop / PC Repair", tags: ["Hardware", "Software"], duration: "1–4 hrs", price: "400 ETB/hr", fixed: false }, { name: "Network Setup", tags: ["Office", "Home"], duration: "2–6 hrs", price: "1,200 ETB", fixed: true }, { name: "Remote IT Support", tags: ["Remote"], duration: "30–60 min", price: "200 ETB", fixed: true }] },
  { id: 4, initials: "HB", color: "#7C3AED", name: "Helen Bekele", headline: "Math & Science Tutor", rating: 5.0, reviews: 23, distance: "2.2 km", price: "350 ETB/hr", verified: true, match: 94, jobs: 46, response: "~3 min", about: "MSc graduate in Applied Mathematics. Tutors grades 7–12 and university entrance prep. Known for making complex concepts simple and building genuine understanding.", services: [{ name: "Secondary School Math", tags: ["Grade 7–12"], duration: "1 hr", price: "350 ETB/hr", fixed: false }, { name: "University Entrance Prep", tags: ["Intensive"], duration: "2 hrs", price: "600 ETB/hr", fixed: false }, { name: "Group Sessions (up to 4)", tags: ["Group", "Discounted"], duration: "1.5 hrs", price: "200 ETB/person", fixed: true }] },
]

const EXTRA_PROVIDERS = [
  { id: 5, initials: "KA", color: "#7EC8E3", name: "Kalid Ahmed", headline: "Licensed Electrician", rating: 4.6, reviews: 31, distance: "2.7 km", price: "350 ETB/hr", verified: true, match: 82 },
  { id: 6, initials: "FG", color: "#D97706", name: "Frehiwot Girma", headline: "Interior Designer", rating: 4.8, reviews: 19, distance: "4.1 km", price: "600 ETB/hr", verified: false, match: 76 },
  { id: 7, initials: "BT", color: "#0F766E", name: "Biruk Tesfaye", headline: "AC & HVAC Technician", rating: 4.5, reviews: 44, distance: "1.2 km", price: "450 ETB/hr", verified: true, match: 85 },
]

const CONVERSATIONS = [
  { id: 1, providerId: 1, name: "Abebe Girma", initials: "AG", color: "#7EC8E3", lastMsg: "I can be there by 3pm, does that work?", time: "2m", unread: 2, online: true },
  { id: 2, providerId: 2, name: "Sara Mekonnen", initials: "SM", color: "#0891B2", lastMsg: "Thank you for the booking! See you tomorrow.", time: "1h", unread: 0, online: false },
  { id: 3, providerId: 3, name: "Dawit Tadesse", initials: "DT", color: "#059669", lastMsg: "The laptop repair is complete. You can pick it up.", time: "3h", unread: 0, online: true },
  { id: 4, providerId: 4, name: "Helen Bekele", initials: "HB", color: "#7C3AED", lastMsg: "Our next session is Thursday at 4pm.", time: "1d", unread: 0, online: false },
]

const BOOKINGS = [
  { id: 1, title: "Pipe Leak Repair", provider: "Abebe Girma", initials: "AG", color: "#7EC8E3", date: "Today, 3:00 PM", price: "600 ETB", status: "confirmed" as const },
  { id: 2, title: "Deep House Cleaning", provider: "Sara Mekonnen", initials: "SM", color: "#0891B2", date: "Aug 18, 9:00 AM", price: "750 ETB", status: "upcoming" as const },
  { id: 3, title: "Laptop Screen Repair", provider: "Dawit Tadesse", initials: "DT", color: "#059669", date: "Aug 12, 11:00 AM", price: "800 ETB", status: "completed" as const },
]

const DM_SEED: Record<number, DMMessage[]> = {
  1: [
    { from: "them", text: "Hello! I saw your request for plumbing help in Bole. I'm available today.", time: "10:12" },
    { from: "me", text: "Great! Can you come at around 3pm? It's a pipe leak in the kitchen.", time: "10:14" },
    { from: "them", text: "Yes, 3pm works perfectly. My rate is 300 ETB/hr, and most kitchen leaks take 1–2 hours.", time: "10:15" },
    { from: "me", text: "Sounds good. I'll book you now.", time: "10:16" },
    { from: "them", text: "I can be there by 3pm, does that work?", time: "10:20" },
  ],
}

// ─── App shell ───────────────────────────────────────────────────────────────

const PhoneShell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #D9DFF0 0%, #C8D0E8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 16px" }}>
    <div style={{ width: 390, height: 844, background: "#F8FAFC", borderRadius: 44, overflow: "hidden", boxShadow: "0 40px 100px rgba(15,23,42,0.28), 0 0 0 1px rgba(15,23,42,0.07)", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  </div>
)

export default function App() {
  const [authed, setAuthed] = useState(false)
  return authed
    ? <MainApp />
    : <PhoneShell><AuthApp onAuth={() => setAuthed(true)} /></PhoneShell>
}

// ─── Auth container ───────────────────────────────────────────────────────────

function AuthApp({ onAuth }: { onAuth: () => void }) {
  const [stage, setStage] = useState<AuthStage>("welcome")
  return <>
    <AuthStatusBar />
    {stage === "welcome" && <WelcomeScreen onLogin={() => setStage("login")} onSignup={() => setStage("signup")} />}
    {stage === "login" && <LoginScreen onBack={() => setStage("welcome")} onForgot={() => setStage("forgot")} onSuccess={onAuth} onSignup={() => setStage("signup")} />}
    {stage === "signup" && <SignupScreen onBack={() => setStage("welcome")} onSuccess={onAuth} onLogin={() => setStage("login")} />}
    {stage === "forgot" && <ForgotScreen onBack={() => setStage("login")} />}
  </>
}

// ─── Main app ─────────────────────────────────────────────────────────────────

function MainApp() {
  const [navStack, setNavStack] = useState<NavView[]>([{ kind: "tab", screen: "home" }])
  const [mode, setMode] = useState<Mode>("client")
  const [aiInput, setAiInput] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "ai", text: "Hi! I'm LINC AI. Describe what you need in plain language — location, budget, urgency — and I'll match you with the best verified providers nearby." },
  ])
  const [aiLoading, setAiLoading] = useState(false)
  const [bookingTab, setBookingTab] = useState<"active" | "upcoming" | "completed">("active")
  const [availability, setAvailability] = useState(true)
  const [dmMessages, setDmMessages] = useState<Record<number, DMMessage[]>>(DM_SEED)
  const [dmInput, setDmInput] = useState("")
  const [showAITrust, setShowAITrust] = useState<Record<number, boolean>>({})

  const currentView = navStack[navStack.length - 1]
  const activeScreen = currentView.kind === "tab" ? currentView.screen : null

  const push = (view: NavView) => setNavStack(prev => [...prev, view])
  const pop = () => setNavStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev))
  const goToTab = (screen: Screen) => setNavStack([{ kind: "tab", screen }])

  const handleAISend = () => {
    if (!aiInput.trim() || aiLoading) return
    const text = aiInput.trim()
    setAiInput("")
    setChatMessages(prev => [...prev, { role: "user", text }])
    setAiLoading(true)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "ai", text: "I analysed your request and found verified providers near Bole. Here are the top matches based on rating, distance, and your budget:", hasProviders: true }])
      setAiLoading(false)
    }, 1400)
  }

  const handleDMSend = (convId: number) => {
    if (!dmInput.trim()) return
    const text = dmInput.trim()
    setDmInput("")
    setDmMessages(prev => ({ ...prev, [convId]: [...(prev[convId] || []), { from: "me", text, time: "now" }] }))
    if (text.toLowerCase().includes("@ai")) {
      setTimeout(() => setShowAITrust(prev => ({ ...prev, [convId]: true })), 600)
    }
  }

  return (
    <PhoneShell>
      {/* Status bar */}
      <div style={{ background: "#7EC8E3", padding: "14px 28px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ color: "#0F172A", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>9:41</span>
        <div style={{ width: 88, height: 18, background: "rgba(0,0,0,0.15)", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.1)" }} />
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><rect x="0" y="4" width="2.5" height="7" rx="0.8" fill="#0F172A" fillOpacity="0.3" /><rect x="4" y="2.5" width="2.5" height="8.5" rx="0.8" fill="#0F172A" fillOpacity="0.55" /><rect x="8" y="1" width="2.5" height="10" rx="0.8" fill="#0F172A" /><rect x="12" y="0" width="2.5" height="11" rx="0.8" fill="#0F172A" /></svg>
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M7 2.5C8.8 2.5 10.4 3.2 11.6 4.4L13 3C11.4 1.4 9.3 0.5 7 0.5C4.7 0.5 2.6 1.4 1 3L2.4 4.4C3.6 3.2 5.2 2.5 7 2.5Z" fill="#0F172A" /><path d="M7 5.5C8.1 5.5 9.1 5.9 9.8 6.7L11.2 5.3C10.1 4.2 8.6 3.5 7 3.5C5.4 3.5 3.9 4.2 2.8 5.3L4.2 6.7C4.9 5.9 5.9 5.5 7 5.5Z" fill="#0F172A" /><circle cx="7" cy="9.5" r="1.5" fill="#0F172A" /></svg>
          <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="#0F172A" strokeOpacity="0.35" /><rect x="1.5" y="1.5" width="17" height="8" rx="2.5" fill="#0F172A" /><path d="M22 3.8V7.2C22.8 6.9 22.8 4.1 22 3.8Z" fill="#0F172A" fillOpacity="0.4" /></svg>
        </div>
      </div>

      {/* Header */}
      <AppHeader currentView={currentView} mode={mode} setMode={setMode} onBack={pop} conversations={CONVERSATIONS} providers={PROVIDERS} />

      {/* Screen */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {currentView.kind === "tab" && currentView.screen === "home" && mode === "client" && (
          <HomeScreen onProvider={id => push({ kind: "providerProfile", id })} onSearch={() => push({ kind: "search", query: "" })} />
        )}
        {currentView.kind === "tab" && currentView.screen === "home" && mode === "provider" && (
          <ProviderDashboard availability={availability} setAvailability={setAvailability} />
        )}
        {currentView.kind === "tab" && currentView.screen === "ai" && (
          <AIScreen messages={chatMessages} aiInput={aiInput} setAiInput={setAiInput} onSend={handleAISend} loading={aiLoading} onProvider={id => push({ kind: "providerProfile", id })} />
        )}
        {currentView.kind === "tab" && currentView.screen === "messages" && (
          <MessagesScreen onConversation={id => push({ kind: "dm", id })} />
        )}
        {currentView.kind === "tab" && currentView.screen === "bookings" && (
          <BookingsScreen tab={bookingTab} setTab={setBookingTab} />
        )}
        {currentView.kind === "tab" && currentView.screen === "profile" && (
          <ProfileScreen onVerification={() => push({ kind: "verification" })} />
        )}
        {currentView.kind === "providerProfile" && (() => {
          const p = PROVIDERS.find(x => x.id === currentView.id)!
          return (
            <ProviderProfileScreen
              provider={p}
              onBook={() => push({ kind: "bookingFlow", providerId: p.id })}
              onDM={() => { const c = CONVERSATIONS.find(x => x.providerId === p.id); if (c) push({ kind: "dm", id: c.id }) }}
            />
          )
        })()}
        {currentView.kind === "dm" && (() => {
          const conv = CONVERSATIONS.find(c => c.id === currentView.id)!
          return (
            <DMScreen
              conversation={conv}
              messages={dmMessages[currentView.id] || []}
              input={dmInput}
              setInput={setDmInput}
              onSend={() => handleDMSend(currentView.id)}
              showTrust={showAITrust[currentView.id] || false}
              onDismissTrust={() => setShowAITrust(prev => ({ ...prev, [currentView.id]: false }))}
            />
          )
        })()}
        {currentView.kind === "search" && (
          <SearchScreen initialQuery={currentView.query} onProvider={id => push({ kind: "providerProfile", id })} />
        )}
        {currentView.kind === "bookingFlow" && (() => {
          const p = PROVIDERS.find(x => x.id === currentView.providerId)!
          return <BookingFlowScreen provider={p} onConfirm={() => { pop(); goToTab("bookings") }} />
        })()}
        {currentView.kind === "verification" && <VerificationScreen />}
      </div>

      {/* Bottom nav — tab screens only */}
      {currentView.kind === "tab" && (
        <BottomNav activeScreen={activeScreen!} goToTab={goToTab} />
      )}
    </PhoneShell>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function BackBtn({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#1E5F7A", flexShrink: 0 }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  )
}

function AppHeader({ currentView, mode, setMode, onBack, conversations, providers }: {
  currentView: NavView; mode: Mode; setMode: (m: Mode) => void; onBack: () => void
  conversations: typeof CONVERSATIONS; providers: typeof PROVIDERS
}) {
  const darkBar = (children: React.ReactNode) => (
    <div style={{ background: "#7EC8E3", padding: "4px 20px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>{children}</div>
  )

  if (currentView.kind === "providerProfile") {
    const p = providers.find(x => x.id === currentView.id)!
    return darkBar(<>
      <BackBtn onBack={onBack} />
      <span style={{ color: "#0F172A", fontSize: 16, fontWeight: 600, flex: 1 }}>{p.name}</span>
      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#1E5F7A" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="5" r="1.2" fill="currentColor" /><circle cx="10" cy="10" r="1.2" fill="currentColor" /><circle cx="10" cy="15" r="1.2" fill="currentColor" /></svg>
      </button>
    </>)
  }

  if (currentView.kind === "dm") {
    const conv = conversations.find(c => c.id === currentView.id)!
    return darkBar(<>
      <BackBtn onBack={onBack} />
      <div style={{ width: 34, height: 34, borderRadius: 11, background: conv.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{conv.initials}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ color: "#0F172A", fontSize: 14, fontWeight: 600 }}>{conv.name}</span>
          <span style={{ fontSize: 11 }}>🛡️</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {conv.online && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669" }} />}
          <span style={{ color: conv.online ? "#059669" : "#1E5F7A", fontSize: 11 }}>{conv.online ? "Online" : "Offline"}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3C3 2.45 3.45 2 4 2H6.27L7.4 5.27L5.9 6.77C6.57 8.15 7.85 9.43 9.23 10.1L10.73 8.6L14 9.73V12C14 12.55 13.55 13 13 13C7.48 13 3 8.52 3 3Z" fill="#1E5F7A" /></svg>,
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="8" rx="1.5" fill="#1E5F7A" /><path d="M11 7L15 5V11L11 9V7Z" fill="#1E5F7A" /></svg>,
        ].map((icon, i) => (
          <button key={i} style={{ background: "rgba(255,255,255,0.35)", border: "none", borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{icon}</button>
        ))}
      </div>
    </>)
  }

  if (currentView.kind === "search") {
    return darkBar(<>
      <BackBtn onBack={onBack} />
      <span style={{ color: "#0F172A", fontSize: 16, fontWeight: 600, flex: 1 }}>Search</span>
    </>)
  }

  if (currentView.kind === "bookingFlow") {
    return darkBar(<>
      <BackBtn onBack={onBack} />
      <span style={{ color: "#0F172A", fontSize: 16, fontWeight: 600, flex: 1 }}>Book Service</span>
    </>)
  }

  if (currentView.kind === "verification") {
    return darkBar(<>
      <BackBtn onBack={onBack} />
      <span style={{ color: "#0F172A", fontSize: 16, fontWeight: 600, flex: 1 }}>Trust & Verification</span>
    </>)
  }

  // Tab screens
  if (currentView.screen === "home") {
    return (
      <div style={{ background: "#7EC8E3", padding: "4px 16px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <button style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", padding: "0 0 6px", cursor: "pointer" }}>
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M5 0C2.79 0 1 1.79 1 4C1 7 5 12 5 12C5 12 9 7 9 4C9 1.79 7.21 0 5 0ZM5 5.5C4.17 5.5 3.5 4.83 3.5 4C3.5 3.17 4.17 2.5 5 2.5C5.83 2.5 6.5 3.17 6.5 4C6.5 4.83 5.83 5.5 5 5.5Z" fill="#1E5F7A" /></svg>
              <span style={{ color: "#1E5F7A", fontSize: 11.5, fontWeight: 600 }}>Addis Ababa, ET</span>
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1L4 4L7 1" stroke="#1E5F7A" strokeWidth="1.3" strokeLinecap="round" /></svg>
            </button>
            <div style={{ color: "#0F172A", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {mode === "client" ? "Good morning, Yonas" : "Provider Dashboard"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C7.24 2 5 4.24 5 7V11L3.5 12.5V13.5H16.5V12.5L15 11V7C15 4.24 12.76 2 10 2Z" fill="#1E5F7A" /><path d="M10 18C11.1 18 12 17.1 12 16H8C8 17.1 8.9 18 10 18Z" fill="#1E5F7A" /></svg>
              <div style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, background: "#EF4444", borderRadius: "50%", border: "1.5px solid #7EC8E3" }} />
            </button>
            <button onClick={() => setMode(mode === "client" ? "provider" : "client")} style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 20, padding: "5px 11px", display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <span style={{ fontSize: 11 }}>{mode === "client" ? "👤" : "💼"}</span>
              <span style={{ color: "#0F172A", fontSize: 11.5, fontWeight: 700 }}>{mode === "client" ? "Client" : "Provider"}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentView.screen === "ai") {
    return (
      <div style={{ background: "#7EC8E3", padding: "4px 20px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✨</div>
        <span style={{ color: "#0F172A", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", flex: 1 }}>LINC AI</span>
        <span style={{ background: "rgba(255,255,255,0.4)", color: "#1E5F7A", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.06em", border: "1px solid rgba(255,255,255,0.6)" }}>BETA</span>
      </div>
    )
  }

  const tabMeta: Partial<Record<Screen, { title: string; icon: React.ReactNode }>> = {
    messages: {
      title: "Messages",
      icon: <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M2 2H15C15.55 2 16 2.45 16 3V12C16 12.55 15.55 13 15 13H4.5L1 16V3C1 2.45 1.45 2 2 2Z" stroke="#1E5F7A" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    },
    bookings: {
      title: "Bookings",
      icon: <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><rect x="1" y="2.5" width="15" height="13" rx="2" stroke="#1E5F7A" strokeWidth="1.5" /><path d="M5 1.5V3.5M12 1.5V3.5M1 6.5H16" stroke="#1E5F7A" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    },
    profile: {
      title: "Profile",
      icon: <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M3 14C3 11.24 5.46 9 8.5 9C11.54 9 14 11.24 14 14" stroke="#1E5F7A" strokeWidth="1.5" strokeLinecap="round" /><circle cx="8.5" cy="5" r="3" stroke="#1E5F7A" strokeWidth="1.5" /></svg>,
    },
  }
  const meta = tabMeta[currentView.screen as Screen]
  return (
    <div style={{ background: "#7EC8E3", padding: "4px 20px 16px", display: "flex", alignItems: "center", flexShrink: 0 }}>
      <span style={{ color: "#0F172A", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", flex: 1 }}>{meta?.title}</span>
      <button style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        {meta?.icon}
      </button>
    </div>
  )
}

// ─── Search Screen ────────────────────────────────────────────────────────────

function SearchScreen({ initialQuery, onProvider }: { initialQuery: string; onProvider: (id: number) => void }) {
  const [query, setQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState("all")
  const [sortBy, setSortBy] = useState("match")

  const filters = [
    { id: "all", label: "All" },
    { id: "verified", label: "🛡️ Verified" },
    { id: "nearby", label: "📍 < 2 km" },
    { id: "toprated", label: "★ 4.8+" },
    { id: "available", label: "⚡ Available now" },
  ]

  const allResults = [
    ...PROVIDERS.map(p => ({ ...p, available: true })),
    ...EXTRA_PROVIDERS.map(p => ({ ...p, jobs: 0, response: "~15 min", about: "", services: [], available: p.id !== 6 })),
  ]

  const filtered = allResults.filter(p => {
    if (activeFilter === "verified") return p.verified
    if (activeFilter === "nearby") return parseFloat(p.distance) < 2
    if (activeFilter === "toprated") return p.rating >= 4.8
    if (activeFilter === "available") return p.available
    return true
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Search input */}
      <div style={{ background: "#7EC8E3", padding: "0 16px 14px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, background: "rgba(0,0,0,0.25)", border: "none", borderRadius: 12, padding: "11px 14px" }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" /><path d="M10.5 10.5L13.5 13.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" /></svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search providers, services…"
              autoFocus
              style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "#fff", fontFamily: "inherit" }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
            )}
          </div>
          <button style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4H14M4 8H12M6 12H10" stroke="#1E5F7A" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="hide-scrollbar" style={{ display: "flex", gap: 7, padding: "10px 16px", overflowX: "auto", background: "#fff", borderBottom: "1px solid #F1F5F9" }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{ background: activeFilter === f.id ? "#0F172A" : "#F1F5F9", color: activeFilter === f.id ? "#fff" : "#475569", border: "none", borderRadius: 20, padding: "6px 13px", fontSize: 11.5, fontWeight: activeFilter === f.id ? 700 : 500, whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#fff", borderBottom: "1px solid #F1F5F9" }}>
        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}><span style={{ fontWeight: 800, color: "#0F172A" }}>{filtered.length}</span> results</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[{ id: "match", label: "Best" }, { id: "distance", label: "Near" }, { id: "rating", label: "Rated" }].map(s => (
            <button key={s.id} onClick={() => setSortBy(s.id)} style={{ background: sortBy === s.id ? "#7EC8E3" : "#F1F5F9", color: sortBy === s.id ? "#fff" : "#64748B", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: sortBy === s.id ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
        {filtered.map((p, i) => (
          <button key={p.id} onClick={() => onProvider(p.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", width: "100%", background: "none", border: "none", borderBottom: "1px solid #F1F5F9", cursor: "pointer", textAlign: "left" }}>
            {/* Avatar */}
            <div style={{ width: 46, height: 46, borderRadius: 14, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
              {p.initials}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                {p.verified && <span style={{ fontSize: 11, flexShrink: 0 }}>🛡️</span>}
                {"available" in p && !p.available && <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500, background: "#F1F5F9", padding: "1px 6px", borderRadius: 5, flexShrink: 0 }}>Busy</span>}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.headline}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11.5, color: "#F59E0B", fontWeight: 600 }}>★ {p.rating}</span>
                <span style={{ fontSize: 11, color: "#CBD5E1" }}>·</span>
                <span style={{ fontSize: 11, color: "#64748B" }}>📍 {p.distance}</span>
                <span style={{ fontSize: 11, color: "#CBD5E1" }}>·</span>
                <span style={{ fontSize: 11, color: "#7EC8E3", fontWeight: 600 }}>{p.price}</span>
              </div>
            </div>
            {/* Match badge */}
            <div style={{ flexShrink: 0, textAlign: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", border: `2.5px solid ${p.match >= 90 ? "#10B981" : "#06B6D4"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: p.match >= 90 ? "#10B981" : "#06B6D4", lineHeight: 1.2, textAlign: "center" as const }}>{p.match}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Booking Flow ─────────────────────────────────────────────────────────────

function BookingFlowScreen({ provider: p, onConfirm }: { provider: typeof PROVIDERS[0]; onConfirm: () => void }) {
  const [selectedService, setSelectedService] = useState(0)
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "escrow">("cash")
  const [note, setNote] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const days = ["Today\nAug 16", "Sun\nAug 17", "Mon\nAug 18", "Tue\nAug 19", "Wed\nAug 20", "Thu\nAug 21"]
  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]
  const bookedTimes = ["11:00 AM", "4:00 PM"]

  const svc = p.services[selectedService]

  if (confirmed) {
    return (
      <div style={{ background: "#F1F5F9", height: "100%" }}>
        <div style={{ background: "#7EC8E3", padding: "0 20px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14L11 20L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 6 }}>Booking Confirmed!</div>
          <div style={{ fontSize: 13, color: "#1E5F7A", lineHeight: 1.6, maxWidth: 280 }}>
            {"Your request has been sent to "}
            <span style={{ fontWeight: 600, color: "#0F172A" }}>{p.name}</span>
            {". You'll be notified once they accept."}
          </div>
        </div>
        <div style={{ background: "#fff", marginBottom: 8 }}>
          {[
            { label: "Service", value: svc.name },
            { label: "Date", value: days[selectedDay].replace("\n", " ") },
            { label: "Time", value: selectedTime || "—" },
            { label: "Payment", value: paymentMethod === "cash" ? "Cash on Delivery" : "Escrow" },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 20px", borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}>
              <span style={{ fontSize: 12.5, color: "#94A3B8" }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{row.value}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "0 16px" }}>
          <button onClick={onConfirm} style={{ width: "100%", background: "#0F172A", color: "#fff", border: "none", borderRadius: 14, padding: "15px 0", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
            View My Bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: "#F1F5F9", paddingBottom: 88 }}>
      {/* Provider mini card — dark band */}
      <div style={{ background: "#7EC8E3", padding: "0 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>{p.initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>{p.name} <span style={{ fontSize: 13 }}>🛡️</span></div>
          <div style={{ fontSize: 11.5, color: "#1E5F7A", marginTop: 1 }}>{p.headline}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700 }}>★ {p.rating}</div>
          <div style={{ fontSize: 11, color: "#1E5F7A" }}>{p.distance}</div>
        </div>
      </div>

      {/* Service selection */}
      <div style={{ background: "#fff", marginBottom: 8 }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>Select Service</span>
        </div>
        {p.services.map((svc, i) => (
          <button key={i} onClick={() => setSelectedService(i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: selectedService === i ? "#FAFBFF" : "none", border: "none", borderBottom: i < p.services.length - 1 ? "1px solid #F1F5F9" : "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selectedService === i ? "#7EC8E3" : "#CBD5E1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {selectedService === i && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7EC8E3" }} />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{svc.name}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{svc.duration}</div>
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: selectedService === i ? "#7EC8E3" : "#334155", flexShrink: 0 }}>{svc.price}</span>
          </button>
        ))}
      </div>

      {/* Date picker */}
      <div style={{ background: "#fff", padding: "14px 16px", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>Select Date</div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {days.map((d, i) => (
            <button key={i} onClick={() => setSelectedDay(i)} style={{ flexShrink: 0, width: 56, padding: "10px 4px", background: selectedDay === i ? "#7EC8E3" : "#F1F5F9", border: "none", borderRadius: 12, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
              {d.split("\n").map((line, j) => (
                <div key={j} style={{ fontSize: j === 0 ? 10 : 12, fontWeight: j === 0 ? 500 : 800, color: selectedDay === i ? (j === 0 ? "#FCA5A5" : "#fff") : (j === 0 ? "#94A3B8" : "#334155") }}>{line}</div>
              ))}
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div style={{ background: "#fff", padding: "14px 16px", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>Select Time</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {times.map(t => {
            const booked = bookedTimes.includes(t)
            const selected = selectedTime === t
            return (
              <button key={t} onClick={() => !booked && setSelectedTime(t)} style={{ padding: "9px 4px", background: selected ? "#7EC8E3" : booked ? "#F8FAFC" : "#F1F5F9", border: "none", borderRadius: 10, cursor: booked ? "default" : "pointer", fontSize: 11.5, fontWeight: selected ? 800 : 500, color: selected ? "#fff" : booked ? "#CBD5E1" : "#334155", textDecoration: booked ? "line-through" : "none", fontFamily: "inherit" }}>
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {/* Note */}
      <div style={{ background: "#fff", padding: "14px 16px", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Note <span style={{ color: "#94A3B8", fontWeight: 500, fontSize: 12 }}>(optional)</span></div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="E.g. The leak is under the sink, second floor…"
          rows={3}
          style={{ width: "100%", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#334155", outline: "none", resize: "none", fontFamily: "inherit" }}
        />
      </div>

      {/* Payment method */}
      <div style={{ background: "#fff", padding: "14px 16px", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>Payment Method</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ id: "cash" as const, icon: "💵", label: "Cash on Delivery" }, { id: "escrow" as const, icon: "🔒", label: "Escrow (Safe Pay)" }].map(pm => (
            <button key={pm.id} onClick={() => setPaymentMethod(pm.id)} style={{ flex: 1, padding: "14px 8px", background: paymentMethod === pm.id ? "#FEF2F2" : "#F8FAFC", border: `1.5px solid ${paymentMethod === pm.id ? "#7EC8E3" : "transparent"}`, borderRadius: 12, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
              <div style={{ fontSize: 20, marginBottom: 5 }}>{pm.icon}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: paymentMethod === pm.id ? "#7EC8E3" : "#475569" }}>{pm.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Price summary */}
      <div style={{ background: "#fff", marginBottom: 8 }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>Price Summary</span>
        </div>
        {[
          { label: p.services[selectedService].name, value: p.services[selectedService].price },
          { label: "LINC service fee (5%)", value: "~15 ETB" },
        ].map((row, i, arr) => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}>
            <span style={{ fontSize: 12.5, color: "#64748B" }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Sticky confirm bar */}
      <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid #E2E8F0" }}>
        <button
          onClick={() => selectedTime && setConfirmed(true)}
          style={{ width: "100%", background: selectedTime ? "#7EC8E3" : "#E2E8F0", color: selectedTime ? "#fff" : "#94A3B8", border: "none", padding: "15px 20px", fontSize: 14, fontWeight: 800, cursor: selectedTime ? "pointer" : "default", fontFamily: "inherit" }}
        >
          {selectedTime ? `Confirm Booking · ${p.services[selectedService].price}` : "Select a time to continue"}
        </button>
      </div>
    </div>
  )
}

// ─── Verification Screen ──────────────────────────────────────────────────────

function VerificationScreen() {
  const [activeDoc, setActiveDoc] = useState<string | null>(null)

  const steps = [
    { label: "Documents\nSubmitted", done: false, active: true },
    { label: "Under\nReview", done: false, active: false },
    { label: "Verified\n& Trusted", done: false, active: false },
  ]

  const docs = [
    { id: "phone", icon: "📱", label: "Phone Number", status: "done" as const, note: "Verified via OTP" },
    { id: "id", icon: "🪪", label: "National ID / Passport", status: "required" as const, note: "Clear photo, all 4 corners visible" },
    { id: "photo", icon: "🤳", label: "Profile Photo", status: "required" as const, note: "Face clearly visible, no sunglasses" },
    { id: "address", icon: "🏠", label: "Address Proof", status: "optional" as const, note: "Utility bill or bank statement (optional)" },
  ]

  return (
    <div style={{ background: "#F1F5F9", paddingBottom: 32 }}>
      {/* Dark trust band */}
      <div style={{ background: "#7EC8E3", padding: "0 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🛡️</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 3 }}>LINC Verified Badge</div>
            <div style={{ fontSize: 12, color: "#1E5F7A" }}>Complete the steps below to earn your badge</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ fontSize: 12, color: "#1E3A4A", lineHeight: 1.6, margin: 0 }}>
            Verified providers get <span style={{ color: "#F59E0B", fontWeight: 700 }}>3× more bookings</span> and appear at the top of every search result.
          </p>
        </div>
      </div>

      {/* Progress tracker */}
      <div style={{ background: "#fff", padding: "16px 20px", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", marginBottom: 14, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>Verification Progress</div>
        <div style={{ display: "flex", alignItems: "flex-start", position: "relative" }}>
          <div style={{ position: "absolute", top: 15, left: "calc(16.67%)", right: "calc(16.67%)", height: 2, background: "#F1F5F9", zIndex: 0 }}>
            <div style={{ width: "0%", height: "100%", background: "#7EC8E3" }} />
          </div>
          {steps.map((step, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: step.done ? "#10B981" : step.active ? "#7EC8E3" : "#F1F5F9", border: `2px solid ${step.done ? "#10B981" : step.active ? "#7EC8E3" : "#E2E8F0"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {step.done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                ) : (
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: step.active ? "#fff" : "#CBD5E1" }} />
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                {step.label.split("\n").map((line, j) => (
                  <div key={j} style={{ fontSize: 10, fontWeight: j === 0 ? 700 : 400, color: step.active ? "#0F172A" : "#94A3B8", lineHeight: 1.3 }}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document checklist */}
      <div style={{ background: "#fff", marginBottom: 8 }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>Required Documents</span>
        </div>
        {docs.map((doc, i) => (
          <div key={doc.id}>
            <button
              onClick={() => doc.status !== "done" && setActiveDoc(activeDoc === doc.id ? null : doc.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: activeDoc === doc.id ? "#FAFBFF" : "none", border: "none", borderBottom: "1px solid #F1F5F9", cursor: doc.status === "done" ? "default" : "pointer", textAlign: "left" }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 11, background: doc.status === "done" ? "#D1FAE5" : "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{doc.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>{doc.label}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{doc.note}</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {doc.status === "done" ? (
                  <span style={{ background: "#D1FAE5", color: "#059669", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>✓ Done</span>
                ) : doc.status === "optional" ? (
                  <span style={{ background: "#F1F5F9", color: "#94A3B8", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 5 }}>Optional</span>
                ) : (
                  <span style={{ background: "#FFFBEB", color: "#D97706", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5 }}>Needed</span>
                )}
              </div>
            </button>

            {activeDoc === doc.id && (
              <div style={{ padding: "14px 16px", background: "#F8FBFF", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button style={{ flex: 1, background: "#fff", border: "1.5px dashed #FECACA", borderRadius: 10, padding: "14px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontFamily: "inherit" }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2V12M10 2L7 5M10 2L13 5" stroke="#7EC8E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 15V16C3 17.1 3.9 18 5 18H15C16.1 18 17 17.1 17 16V15" stroke="#7EC8E3" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#7EC8E3" }}>Upload File</span>
                  </button>
                  <button style={{ flex: 1, background: "#fff", border: "1.5px dashed #FECACA", borderRadius: 10, padding: "14px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontFamily: "inherit" }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="13" rx="2.5" stroke="#7EC8E3" strokeWidth="1.5" /><circle cx="10" cy="11" r="3" stroke="#7EC8E3" strokeWidth="1.5" /><path d="M7 4V2.5C7 1.67 7.67 1 8.5 1H11.5C12.33 1 13 1.67 13 2.5V4" stroke="#7EC8E3" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#7EC8E3" }}>Take Photo</span>
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#94A3B8" strokeWidth="1.2" /><path d="M6 5.5V8.5M6 3.5V4" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  <span style={{ fontSize: 10.5, color: "#94A3B8" }}>Documents are encrypted and never shared publicly.</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Privacy note */}
      <div style={{ background: "#fff", padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
        <p style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.5, margin: 0 }}>
          All documents are <span style={{ fontWeight: 700, color: "#334155" }}>end-to-end encrypted</span> and reviewed only by LINC's trust & safety team.
        </p>
      </div>

      <div style={{ padding: "0 16px" }}>
        <button style={{ width: "100%", background: "#0F172A", color: "#fff", border: "none", borderRadius: 14, padding: "14px 0", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
          Submit for Review
        </button>
      </div>
    </div>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function HomeScreen({ onProvider, onSearch }: { onProvider: (id: number) => void; onSearch: () => void }) {
  const cats = [
    { icon: "🔧", label: "Repairs", color: "#7EC8E3" },
    { icon: "🧹", label: "Cleaning", color: "#059669" },
    { icon: "💻", label: "IT & Tech", color: "#0891B2" },
    { icon: "📚", label: "Tutoring", color: "#D97706" },
    { icon: "⚡", label: "Electric", color: "#7EC8E3" },
    { icon: "🚗", label: "Transport", color: "#7C3AED" },
    { icon: "💆", label: "Wellness", color: "#0F766E" },
    { icon: "🎨", label: "Creative", color: "#BE185D" },
  ]

  return (
    <div style={{ background: "#F1F5F9", paddingBottom: 16 }}>

      {/* Search — light blue band continues from header */}
      <div style={{ backgroundColor: "#7EC8E3", padding: "0 16px 20px" }}>
        <button onClick={onSearch} style={{ width: "100%", background: "rgba(255,255,255,0.45)", border: "none", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left" }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#1E5F7A" strokeWidth="1.6" /><path d="M10.5 10.5L13.5 13.5" stroke="#1E5F7A" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <span style={{ color: "#1E5F7A", fontSize: 13, flex: 1, fontWeight: 500 }}>What do you need help with?</span>
          <div style={{ background: "#7EC8E3", borderRadius: 7, padding: "4px 9px", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
            <span style={{ fontSize: 10 }}>✨</span>
            <span style={{ color: "#0F172A", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em" }}>AI</span>
          </div>
        </button>
      </div>

      {/* Quick chips */}
      <div className="hide-scrollbar" style={{ display: "flex", gap: 7, padding: "12px 16px", overflowX: "auto", background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
        {[["🚨", "Urgent"], ["🧹", "Cleaning"], ["📚", "Tutor"], ["💻", "IT Help"], ["🔧", "Repairs"], ["🚗", "Transport"]].map(([icon, label]) => (
          <button key={label} onClick={onSearch} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 20, padding: "5px 12px", whiteSpace: "nowrap", fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
            <span style={{ fontSize: 12 }}>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Categories */}
      <div style={{ background: "#fff", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 12px" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>Categories</span>
          <button onClick={onSearch} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#7EC8E3", fontFamily: "inherit" }}>See all</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid #F1F5F9" }}>
          {cats.map((cat, i) => (
            <button key={cat.label} onClick={onSearch} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "14px 4px", borderRight: (i + 1) % 4 !== 0 ? "1px solid #F1F5F9" : "none", borderBottom: i < 4 ? "1px solid #F1F5F9" : "none", fontFamily: "inherit" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: cat.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{cat.icon}</div>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#475569" }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Verified Nearby */}
      <div style={{ background: "#fff", marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 12px", borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>Verified Nearby</span>
            <span style={{ fontSize: 11, color: "#94A3B8", marginLeft: 8 }}>Bole · 2 km</span>
          </div>
          <button onClick={onSearch} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#7EC8E3", fontFamily: "inherit" }}>See all</button>
        </div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {PROVIDERS.map((p, i) => (
            <button key={p.id} onClick={() => onProvider(p.id)} style={{ width: 148, flexShrink: 0, background: "none", border: "none", borderRight: i < PROVIDERS.length - 1 ? "1px solid #F1F5F9" : "none", padding: "14px 12px", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
              {/* Avatar + verified */}
              <div style={{ position: "relative", width: 44, height: 44, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800 }}>{p.initials}</div>
                <div style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: "#F59E0B", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name.split(" ")[0]}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.headline.split(" ").slice(0, 3).join(" ")}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>★ {p.rating}</span>
                <span style={{ fontSize: 10, color: "#CBD5E1" }}>·</span>
                <span style={{ fontSize: 10.5, color: "#94A3B8" }}>{p.distance}</span>
              </div>
              <div style={{ background: "#7EC8E3", borderRadius: 8, padding: "6px 0", textAlign: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#0F172A" }}>Book</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Open Requests */}
      <div style={{ background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 0", marginBottom: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>Open Requests</span>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#7EC8E3", fontFamily: "inherit" }}>Browse</button>
        </div>
        {[
          { title: "Electrician needed in Kazanchis", budget: "500 ETB", time: "12m ago", offers: 3, urgent: false, icon: "⚡" },
          { title: "Urgent AC repair — Bole road office", budget: "800–1,200 ETB", time: "28m ago", offers: 1, urgent: true, icon: "❄️" },
          { title: "Math tutor, 9th grade — twice a week", budget: "350 ETB/session", time: "1h ago", offers: 5, urgent: false, icon: "📚" },
        ].map((req, i, arr) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: req.urgent ? "#FEF2F2" : "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{req.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                {req.urgent && <span style={{ background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1.5px 5px", borderRadius: 4, letterSpacing: "0.07em", flexShrink: 0 }}>URGENT</span>}
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.title}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700 }}>{req.budget}</span>
                <span style={{ fontSize: 11, color: "#CBD5E1" }}>·</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{req.time}</span>
                <span style={{ fontSize: 11, color: "#CBD5E1" }}>·</span>
                <span style={{ fontSize: 11, color: "#64748B" }}>{req.offers} offers</span>
              </div>
            </div>
            <button style={{ background: "#FEF2F2", color: "#7EC8E3", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 11.5, fontWeight: 800, cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>Offer</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Provider Profile ─────────────────────────────────────────────────────────

function ProviderProfileScreen({ provider: p, onBook, onDM }: { provider: typeof PROVIDERS[0]; onBook: () => void; onDM: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  const reviews = [
    { name: "Mekdes A.", initials: "MA", color: "#7C3AED", stars: 5, text: "Incredibly professional. Fixed our leak in under an hour and cleaned up after himself.", date: "Aug 3", verified: true },
    { name: "Yared G.", initials: "YG", color: "#0891B2", stars: 5, text: "Fast response, fair price, quality work. Will definitely call again.", date: "Jul 19", verified: true },
    { name: "Tigist B.", initials: "TB", color: "#059669", stars: 4, text: "Good work overall. Came on time and was very honest about what needed repair vs replacement.", date: "Jun 28", verified: false },
  ]

  return (
    <div style={{ background: "#F1F5F9", paddingBottom: 88 }}>
      {/* Dark hero band */}
      <div style={{ background: "#7EC8E3", padding: "0 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 66, height: 66, borderRadius: 20, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800, flexShrink: 0, border: "2.5px solid rgba(255,255,255,0.12)" }}>{p.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 3 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: "#1E5F7A", marginBottom: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.headline}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(245,158,11,0.2)" }}>🛡️ VERIFIED</span>
              <span style={{ background: "rgba(16,185,129,0.12)", color: "#34D399", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.2)" }}>⚡ {p.response}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ background: "#fff", display: "flex", borderBottom: "1px solid #E2E8F0", marginBottom: 8 }}>
        {[
          { label: "Rating", value: `★ ${p.rating}`, sub: `${p.reviews} reviews`, accent: "#F59E0B" },
          { label: "Jobs Done", value: `${p.jobs}`, sub: "completed", accent: "#0F172A" },
          { label: "Distance", value: p.distance, sub: "from you", accent: "#0F172A" },
        ].map((s, i, arr) => (
          <div key={s.label} style={{ flex: 1, padding: "14px 8px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.accent, letterSpacing: "-0.01em" }}>{s.value}</div>
            <div style={{ fontSize: 10.5, color: "#94A3B8", marginTop: 2, fontWeight: 500 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* About */}
      <div style={{ background: "#fff", padding: "16px 16px 20px", marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>About</div>
        <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, margin: 0 }}>{p.about}</p>
      </div>

      {/* Services */}
      <div style={{ background: "#fff", marginBottom: 8 }}>
        <div style={{ padding: "14px 16px 0", borderBottom: "1px solid #F1F5F9" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>Services Offered</span>
        </div>
        {p.services.map((svc, i) => (
          <div key={i}>
            <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ width: "100%", background: expanded === i ? "#FAFBFF" : "none", border: "none", padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", borderBottom: expanded !== i && i < p.services.length - 1 ? "1px solid #F1F5F9" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{svc.name}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
                  {svc.tags.map(tag => <span key={tag} style={{ background: "#F1F5F9", color: "#64748B", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5 }}>{tag}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#7EC8E3", marginBottom: 1 }}>{svc.price}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{svc.duration}</div>
              </div>
            </button>
            {expanded === i && (
              <div style={{ borderBottom: i < p.services.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                <div style={{ display: "flex", borderTop: "1px solid #F1F5F9" }}>
                  <button onClick={onDM} style={{ flex: 1, background: "#F8FAFC", color: "#475569", border: "none", borderRight: "1px solid #F1F5F9", padding: "11px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Ask a Question</button>
                  <button onClick={onBook} style={{ flex: 1, background: "#0F172A", color: "#fff", border: "none", padding: "11px 0", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Book This</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div style={{ background: "#fff", marginBottom: 8 }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>Reviews</span>
          <span style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700 }}>★ {p.rating} · {p.reviews} total</span>
        </div>
        {reviews.map((r, i) => (
          <div key={i} style={{ padding: "14px 16px", borderBottom: i < reviews.length - 1 ? "1px solid #F1F5F9" : "none" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: r.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{r.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{r.name}</span>
                    {r.verified && <span style={{ background: "#ECFDF5", color: "#059669", fontSize: 9, fontWeight: 700, padding: "1.5px 6px", borderRadius: 4 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 10.5, color: "#94A3B8" }}>{r.date}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "#F59E0B", marginBottom: 5, letterSpacing: "0.04em" }}>{"★".repeat(r.stars)}<span style={{ color: "#E2E8F0" }}>{"★".repeat(5 - r.stars)}</span></div>
                <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.55, margin: 0 }}>{r.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky action bar */}
      <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "1px solid #E2E8F0", display: "flex" }}>
        <button onClick={onDM} style={{ flex: 1, background: "#fff", color: "#334155", border: "none", borderRight: "1px solid #F1F5F9", padding: "14px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Message</button>
        <button onClick={onBook} style={{ flex: 2, background: "#0F172A", color: "#fff", border: "none", padding: "14px 0", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Book Now · {p.price}</button>
      </div>
    </div>
  )
}

// ─── DM Screen ────────────────────────────────────────────────────────────────

function DMScreen({ conversation: conv, messages, input, setInput, onSend, showTrust, onDismissTrust }: {
  conversation: typeof CONVERSATIONS[0]; messages: DMMessage[]; input: string; setInput: (v: string) => void
  onSend: () => void; showTrust: boolean; onDismissTrust: () => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F1F5F9" }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "14px 14px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          <span style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 600 }}>Today</span>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
        </div>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 6, display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 7 }}>
            {msg.from === "them" && <div style={{ width: 24, height: 24, borderRadius: 8, background: conv.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 8, fontWeight: 800, flexShrink: 0, marginBottom: 14 }}>{conv.initials}</div>}
            <div>
              <div style={{ background: msg.from === "me" ? "#7EC8E3" : "#fff", color: msg.from === "me" ? "#fff" : "#1E293B", borderRadius: msg.from === "me" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", padding: "9px 13px", fontSize: 13, lineHeight: 1.5, maxWidth: 248, fontWeight: 500 }}>{msg.text}</div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3, textAlign: msg.from === "me" ? "right" : "left" }}>{msg.time}</div>
            </div>
          </div>
        ))}
        {showTrust && (
          <div style={{ margin: "12px 0 16px" }}>
            <div style={{ background: "rgba(15,23,42,0.92)", backdropFilter: "blur(12px)", borderRadius: 16, padding: "14px 16px", border: "1px solid rgba(220,38,38,0.3)", boxShadow: "0 8px 32px rgba(220,38,38,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #7EC8E3, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✨</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>AI Trust Advisor</div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>🔒 Only visible to you</div>
                  </div>
                </div>
                <button onClick={onDismissTrust} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 0, fontSize: 18, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "10px 12px", background: "rgba(16,185,129,0.12)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.2)" }}>
                <span style={{ fontSize: 20 }}>🟢</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#34D399" }}>Strong Trust Score</div>
                  <div style={{ fontSize: 11, color: "#6EE7B7" }}>This provider has a clean record</div>
                </div>
              </div>
              {[{ icon: "⏱️", label: "On-time completion", value: "98%" }, { icon: "🚩", label: "Complaints / Reports", value: "0" }, { icon: "💬", label: "Avg. response time", value: "~5 min" }, { icon: "💰", label: "Market rate check", value: "Fair (280–350 ETB/hr)" }].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ fontSize: 13 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0" }}>{item.value}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#64748B", textAlign: "center" as const, marginTop: 4 }}>Based on verified bookings and platform data</div>
            </div>
          </div>
        )}
      </div>
      {!showTrust && (
        <div style={{ padding: "6px 14px 0", display: "flex", alignItems: "center", gap: 6, background: "#fff", borderTop: "1px solid #F1F5F9" }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: "linear-gradient(135deg, #7EC8E3, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, flexShrink: 0 }}>✨</div>
          <span style={{ fontSize: 10.5, color: "#94A3B8" }}>Type <span style={{ color: "#F87171", fontWeight: 700 }}>@AI</span> for a private trust insight</span>
        </div>
      )}
      <div style={{ padding: "8px 12px 12px", background: "#fff" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#F1F5F9", borderRadius: 14, padding: "4px 4px 4px 12px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && onSend()} placeholder="Message or type @AI…" style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "#0F172A", fontFamily: "inherit", padding: "6px 0" }} />
          <button style={{ width: 34, height: 34, borderRadius: 10, background: "#F8FAFC", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="2" width="11" height="11" rx="2.5" stroke="#94A3B8" strokeWidth="1.3" /><path d="M5 7.5H10M7.5 5V10" stroke="#94A3B8" strokeWidth="1.3" strokeLinecap="round" /></svg>
          </button>
          <button onClick={onSend} style={{ width: 34, height: 34, borderRadius: 10, background: "#7EC8E3", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 1L12 6.5L1 12V8L9 6.5L1 5V1Z" fill="white" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Provider Dashboard ───────────────────────────────────────────────────────

function ProviderDashboard({ availability, setAvailability }: { availability: boolean; setAvailability: (v: boolean) => void }) {
  return (
    <div style={{ background: "#F1F5F9", paddingBottom: 16 }}>
      {/* Availability banner */}
      <div style={{ background: availability ? "#ECFDF5" : "#FEF2F2", borderBottom: `2px solid ${availability ? "#10B981" : "#EF4444"}`, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: availability ? "#065F46" : "#991B1B" }}>{availability ? "🟢 Available for Instant Booking" : "🔴 Currently Unavailable"}</div>
          <div style={{ fontSize: 11.5, color: availability ? "#059669" : "#7EC8E3", marginTop: 2 }}>{availability ? "Clients can reach you right now" : "Toggle to accept new requests"}</div>
        </div>
        <button onClick={() => setAvailability(!availability)} style={{ width: 48, height: 27, borderRadius: 14, background: availability ? "#10B981" : "#CBD5E1", border: "none", cursor: "pointer", position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 2.5, left: availability ? 23 : 2.5, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)", transition: "left 0.15s" }} />
        </button>
      </div>

      {/* Metrics grid */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", marginBottom: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          {[
            { label: "This Month", value: "12,400 ETB", icon: "💰", color: "#7EC8E3" },
            { label: "Active Jobs", value: "3", icon: "💼", color: "#10B981" },
            { label: "Profile Views", value: "142", icon: "👁️", color: "#0891B2" },
            { label: "Match Score", value: "94%", icon: "🎯", color: "#F59E0B" },
          ].map((m, i) => (
            <div key={m.label} style={{ padding: "16px", borderRight: i % 2 === 0 ? "1px solid #F1F5F9" : "none", borderBottom: i < 2 ? "1px solid #F1F5F9" : "none" }}>
              <div style={{ fontSize: 17, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.color, letterSpacing: "-0.02em" }}>{m.value}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming requests */}
      <div style={{ background: "#fff" }}>
        <div style={{ padding: "14px 16px 0", borderBottom: "1px solid #F1F5F9" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>Incoming Requests</span>
        </div>
        {[
          { client: "Beza Tesfaye", service: "Pipe Leak Repair", budget: "500 ETB", timeLeft: "12 min", initials: "BT", color: "#7C3AED" },
          { client: "Michael Alemu", service: "Bathroom Renovation", budget: "2,000 ETB", timeLeft: "28 min", initials: "MA", color: "#0891B2" },
        ].map((req, i, arr) => (
          <div key={i} style={{ padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: req.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{req.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>{req.service}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 1 }}>{req.client} · <span style={{ color: "#10B981", fontWeight: 700 }}>{req.budget}</span></div>
              </div>
              <span style={{ fontSize: 11, color: "#D97706", fontWeight: 700, background: "#FFFBEB", border: "1px solid #FDE68A", padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>⏱ {req.timeLeft}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ flex: 1, background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0", borderRadius: 10, padding: "9px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Decline</button>
              <button style={{ flex: 2, background: "#0F172A", color: "#fff", border: "none", borderRadius: 10, padding: "9px 0", fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Accept Request</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── AI Screen ────────────────────────────────────────────────────────────────

function AIScreen({ messages, aiInput, setAiInput, onSend, loading, onProvider }: { messages: ChatMessage[]; aiInput: string; setAiInput: (v: string) => void; onSend: () => void; loading: boolean; onProvider: (id: number) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F1F5F9" }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "14px 14px 10px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            {msg.role === "ai" ? (
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 9, background: "linear-gradient(135deg, #7EC8E3, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✨</div>
                  <div style={{ background: "#fff", borderRadius: "3px 14px 14px 14px", padding: "10px 13px", border: "1px solid #E2E8F0", maxWidth: "82%" }}>
                    <span style={{ fontSize: 13, color: "#1E293B", lineHeight: 1.6, fontWeight: 500 }}>{msg.text}</span>
                  </div>
                </div>
                {msg.hasProviders && (
                  <div style={{ marginLeft: 36, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                    {PROVIDERS.slice(0, 2).map(p => (
                      <div key={p.id} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px 10px" }}>
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 13, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>{p.initials}</div>
                            <div style={{ position: "absolute", bottom: -2, right: -2, width: 15, height: 15, borderRadius: "50%", background: "#F59E0B", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 3.5L3 5.5L6 1.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" /></svg>
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.headline}</div>
                          </div>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", border: `2.5px solid ${p.match > 93 ? "#10B981" : "#06B6D4"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 9, fontWeight: 800, color: p.match > 93 ? "#10B981" : "#06B6D4", lineHeight: 1.2, textAlign: "center" as const }}>{p.match}%<br /><span style={{ fontSize: 7 }}>match</span></span>
                          </div>
                        </div>
                        <div style={{ padding: "0 12px 10px", display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid #F1F5F9" }}>
                          <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>★ {p.rating}</span>
                          <span style={{ fontSize: 10, color: "#CBD5E1" }}>·</span>
                          <span style={{ fontSize: 11, color: "#64748B" }}>📍 {p.distance}</span>
                          <span style={{ fontSize: 10, color: "#CBD5E1" }}>·</span>
                          <span style={{ fontSize: 11, color: "#7EC8E3", fontWeight: 700 }}>{p.price}</span>
                        </div>
                        <div style={{ display: "flex" }}>
                          <button style={{ flex: 1, background: "#0F172A", color: "#fff", border: "none", padding: "10px 0", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Book</button>
                          <button onClick={() => onProvider(p.id)} style={{ flex: 1, background: "#F8FAFC", color: "#475569", border: "none", borderLeft: "1px solid #E2E8F0", padding: "10px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Profile</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: "#7EC8E3", borderRadius: "14px 3px 14px 14px", padding: "10px 13px", maxWidth: "76%" }}>
                  <span style={{ fontSize: 13, color: "#0F172A", lineHeight: 1.6, fontWeight: 500 }}>{msg.text}</span>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: "linear-gradient(135deg, #7EC8E3, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>✨</div>
            <div style={{ background: "#fff", borderRadius: "3px 14px 14px 14px", padding: "13px 14px", border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#CBD5E1", animation: `dot-pulse 1.2s ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Suggestions */}
      <div className="hide-scrollbar" style={{ display: "flex", gap: 7, padding: "8px 14px", overflowX: "auto", borderTop: "1px solid #E2E8F0", background: "#fff" }}>
        {["Find a plumber", "House cleaning today", "IT support", "Math tutor"].map(s => (
          <button key={s} onClick={() => { setAiInput(s); }} style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 20, padding: "5px 12px", whiteSpace: "nowrap", fontSize: 11.5, fontWeight: 600, color: "#475569", cursor: "pointer", flexShrink: 0, fontFamily: "inherit" }}>{s}</button>
        ))}
      </div>
      <div style={{ padding: "10px 12px 14px", background: "#fff", borderTop: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#F1F5F9", border: "1.5px solid #E2E8F0", borderRadius: 14, padding: "4px 4px 4px 14px" }}>
          <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && onSend()} placeholder="Describe what you need…" style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "#0F172A", fontFamily: "inherit", padding: "6px 0" }} />
          <button onClick={onSend} style={{ width: 36, height: 36, borderRadius: 11, background: "#7EC8E3", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 7L1 13V8.5L10 7L1 5.5V1Z" fill="white" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Messages ─────────────────────────────────────────────────────────────────

function MessagesScreen({ onConversation }: { onConversation: (id: number) => void }) {
  return (
    <div style={{ background: "#fff" }}>
      {/* Search bar */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F1F5F9", borderRadius: 10, padding: "8px 12px" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#94A3B8" strokeWidth="1.3" /><path d="M9.5 9.5L12.5 12.5" stroke="#94A3B8" strokeWidth="1.3" strokeLinecap="round" /></svg>
          <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>Search messages…</span>
        </div>
      </div>
      {CONVERSATIONS.map((conv, i) => (
        <button key={conv.id} onClick={() => onConversation(conv.id)} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 16px", cursor: "pointer", width: "100%", background: conv.unread > 0 ? "#FAFBFF" : "#fff", border: "none", borderBottom: "1px solid #F1F5F9", textAlign: "left", fontFamily: "inherit" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 50, height: 50, borderRadius: 17, background: conv.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800 }}>{conv.initials}</div>
            {conv.online && <div style={{ position: "absolute", bottom: 1, right: 1, width: 12, height: 12, background: "#10B981", borderRadius: "50%", border: "2px solid #fff" }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: conv.unread > 0 ? 800 : 600, color: "#0F172A" }}>{conv.name}</span>
              <span style={{ fontSize: 11, color: conv.unread > 0 ? "#7EC8E3" : "#94A3B8", fontWeight: conv.unread > 0 ? 700 : 400, flexShrink: 0 }}>{conv.time}</span>
            </div>
            <span style={{ fontSize: 12.5, color: conv.unread > 0 ? "#334155" : "#94A3B8", fontWeight: conv.unread > 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{conv.lastMsg}</span>
          </div>
          {conv.unread > 0 && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#7EC8E3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>{conv.unread}</span></div>}
        </button>
      ))}
    </div>
  )
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

function BookingsScreen({ tab, setTab }: { tab: "active" | "upcoming" | "completed"; setTab: (t: "active" | "upcoming" | "completed") => void }) {
  const cfg = { confirmed: { label: "Confirmed", color: "#059669", dot: "#10B981" }, upcoming: { label: "Upcoming", color: "#D97706", dot: "#F59E0B" }, completed: { label: "Done", color: "#64748B", dot: "#CBD5E1" } }
  const filtered = BOOKINGS.filter(b => tab === "active" ? b.status === "confirmed" : tab === "upcoming" ? b.status === "upcoming" : b.status === "completed")
  return (
    <div style={{ background: "#F1F5F9", flex: 1 }}>
      {/* Tab bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 16px", display: "flex" }}>
        {(["active", "upcoming", "completed"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: "none", color: tab === t ? "#7EC8E3" : "#94A3B8", border: "none", borderBottom: tab === t ? "2.5px solid #7EC8E3" : "2.5px solid transparent", padding: "12px 4px", fontSize: 12.5, fontWeight: tab === t ? 800 : 600, cursor: "pointer", textTransform: "capitalize" as const, fontFamily: "inherit" }}>{t}</button>
        ))}
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0
          ? <div style={{ textAlign: "center", padding: "56px 0", color: "#94A3B8", fontSize: 14, fontWeight: 500 }}>No {tab} bookings</div>
          : filtered.map(b => {
            const c = cfg[b.status]
            return (
              <div key={b.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                {/* Top row */}
                <div style={{ padding: "14px 14px 12px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: b.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{b.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 2, letterSpacing: "-0.01em" }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{b.provider}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot }} />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: c.color }}>{c.label}</span>
                  </div>
                </div>
                {/* Date + price row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F8FAFC", borderTop: "1px solid #F1F5F9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="2" stroke="#94A3B8" strokeWidth="1.2" /><path d="M4 1V3M9 1V3M1 5H12" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{b.date}</span>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>{b.price}</span>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", borderTop: "1px solid #F1F5F9" }}>
                  {b.status !== "completed"
                    ? <>
                      <button style={{ flex: 1, background: "#fff", color: "#64748B", border: "none", borderRight: "1px solid #F1F5F9", padding: "11px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Reschedule</button>
                      <button style={{ flex: 1, background: "#0F172A", color: "#fff", border: "none", padding: "11px 0", fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Chat</button>
                    </>
                    : <button style={{ flex: 1, background: "#FFFBEB", color: "#D97706", border: "none", padding: "11px 0", fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>★ Leave Review</button>
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfileScreen({ onVerification }: { onVerification: () => void }) {
  const menuGroups = [
    [
      { icon: "🔔", label: "Notifications", badge: "3" },
      { icon: "📍", label: "Saved Locations", badge: null },
      { icon: "💳", label: "Payment Methods", badge: null },
    ],
    [
      { icon: "🛡️", label: "Trust & Verification", badge: null, action: onVerification, highlight: true },
      { icon: "❓", label: "Help & Support", badge: null },
      { icon: "⚙️", label: "Account Settings", badge: null },
    ],
  ]
  return (
    <div style={{ background: "#F1F5F9", paddingBottom: 16 }}>
      {/* Profile header card */}
      <div style={{ background: "#7EC8E3", padding: "16px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 62, height: 62, borderRadius: 20, background: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F172A", fontSize: 22, fontWeight: 800, flexShrink: 0, border: "3px solid rgba(255,255,255,0.7)" }}>YM</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>Yonas Molla</div>
            <div style={{ fontSize: 12, color: "#1E5F7A", marginTop: 2 }}>yonas.molla@email.com</div>
            <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
              <span style={{ background: "rgba(255,255,255,0.5)", color: "#0F172A", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, letterSpacing: "0.06em" }}>✓ VERIFIED</span>
              <span style={{ background: "rgba(255,255,255,0.5)", color: "#0F172A", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>👤 Client</span>
            </div>
          </div>
          <button style={{ background: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7H13M7 1L13 7L7 13" stroke="#1E5F7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ background: "#fff", display: "flex", borderBottom: "1px solid #E2E8F0", marginBottom: 8 }}>
        {[{ label: "Bookings", value: "12" }, { label: "Reviews", value: "8" }, { label: "Saved", value: "24" }].map((s, i, arr) => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "16px 0", borderRight: i < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menu groups */}
      {menuGroups.map((group, gi) => (
        <div key={gi} style={{ background: "#fff", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", marginBottom: 8 }}>
          {group.map((item: any, i: number) => (
            <button key={item.label} onClick={item.action || undefined} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", background: "none", border: "none", borderBottom: i < group.length - 1 ? "1px solid #F1F5F9" : "none", width: "100%", fontFamily: "inherit" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: item.highlight ? "#FEF2F2" : "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{item.icon}</div>
                <span style={{ fontSize: 14, color: item.highlight ? "#7EC8E3" : "#1E293B", fontWeight: item.highlight ? 700 : 600 }}>{item.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {item.badge && <div style={{ width: 19, height: 19, borderRadius: "50%", background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>{item.badge}</span></div>}
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1L5 5L1 9" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </div>
            </button>
          ))}
        </div>
      ))}

      <div style={{ padding: "4px 0 8px", textAlign: "center" }}>
        <button style={{ color: "#EF4444", background: "none", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Sign Out</button>
      </div>
    </div>
  )
}

// ─── Auth: Status Bar ────────────────────────────────────────────────────────

function AuthStatusBar() {
  return (
    <div style={{ background: "#7EC8E3", padding: "14px 28px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
      <span style={{ color: "#0F172A", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>9:41</span>
      <div style={{ width: 88, height: 18, background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.1)" }} />
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none"><rect x="0" y="4" width="2.5" height="7" rx="0.8" fill="white" fillOpacity="0.35" /><rect x="4" y="2.5" width="2.5" height="8.5" rx="0.8" fill="white" fillOpacity="0.6" /><rect x="8" y="1" width="2.5" height="10" rx="0.8" fill="white" /><rect x="12" y="0" width="2.5" height="11" rx="0.8" fill="white" /></svg>
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M7 2.5C8.8 2.5 10.4 3.2 11.6 4.4L13 3C11.4 1.4 9.3 0.5 7 0.5C4.7 0.5 2.6 1.4 1 3L2.4 4.4C3.6 3.2 5.2 2.5 7 2.5Z" fill="white" /><path d="M7 5.5C8.1 5.5 9.1 5.9 9.8 6.7L11.2 5.3C10.1 4.2 8.6 3.5 7 3.5C5.4 3.5 3.9 4.2 2.8 5.3L4.2 6.7C4.9 5.9 5.9 5.5 7 5.5Z" fill="white" /><circle cx="7" cy="9.5" r="1.5" fill="white" /></svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="20" height="10" rx="3" stroke="white" strokeOpacity="0.35" /><rect x="1.5" y="1.5" width="17" height="8" rx="2.5" fill="white" /><path d="M22 3.8V7.2C22.8 6.9 22.8 4.1 22 3.8Z" fill="white" fillOpacity="0.4" /></svg>
      </div>
    </div>
  )
}

// ─── Auth: Welcome / Splash ───────────────────────────────────────────────────

function WelcomeScreen({ onLogin, onSignup }: { onLogin: () => void; onSignup: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#7EC8E3", overflow: "hidden", position: "relative" }}>
      {/* Background orbs */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 180, left: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,0,0,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ width: 76, height: 76, borderRadius: 24, background: "rgba(255,255,255,0.5)", border: "2px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, marginLeft: "auto", marginRight: "auto", boxShadow: "0 12px 36px rgba(0,0,0,0.1)" }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <path d="M19 6C19 6 8 12 8 20C8 26 13 30 19 30C25 30 30 26 30 20C30 12 19 6 19 6Z" fill="white" fillOpacity="0.9" />
              <circle cx="19" cy="20" r="5" fill="rgba(180,0,0,0.8)" />
              <path d="M19 15V10M24 17L28 14M14 17L10 14" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 6 }}>LINC</div>
            <div style={{ fontSize: 13, color: "#1E5F7A", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>Life Infrastructure Network</div>
          </div>
        </div>

        <p style={{ fontSize: 15, color: "#1E5F7A", textAlign: "center", lineHeight: 1.65, maxWidth: 280, margin: "0 0 36px" }}>
          Connect with verified local providers for any everyday service — from repairs to tutoring.
        </p>

        {/* Trust row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 44, background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", padding: "14px 10px" }}>
          {[{ icon: "🛡️", label: "Verified" }, { icon: "⚡", label: "Fast Match" }, { icon: "💬", label: "Secure Chat" }].map((item, i, arr) => (
            <div key={item.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 11, color: "#1E5F7A", fontWeight: 600 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA area */}
      <div style={{ padding: "0 24px 40px", position: "relative", zIndex: 1 }}>
        <button onClick={onSignup} style={{ width: "100%", background: "#fff", color: "#7EC8E3", border: "none", borderRadius: 16, padding: "16px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 12, boxShadow: "0 6px 24px rgba(0,0,0,0.2)" }}>
          Create an Account
        </button>
        <button onClick={onLogin} style={{ width: "100%", background: "rgba(255,255,255,0.4)", color: "#0F172A", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 16, padding: "15px 0", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Sign In
        </button>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#1E5F7A", lineHeight: 1.5 }}>
          By continuing you agree to our{" "}
          <span style={{ color: "#0F172A", cursor: "pointer", fontWeight: 600 }}>Terms of Service</span>{" "}
          and{" "}
          <span style={{ color: "#0F172A", cursor: "pointer", fontWeight: 600 }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}

// ─── Auth: Input field helper ─────────────────────────────────────────────────

function AuthInput({ label, type = "text", placeholder, value, onChange, autoFocus, right }: {
  label: string; type?: string; placeholder: string; value: string; onChange: (v: string) => void; autoFocus?: boolean; right?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6, letterSpacing: "0.02em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", background: "#fff", border: `1.5px solid ${focused ? "#7EC8E3" : "#E2E8F0"}`, borderRadius: 13, padding: "12px 14px", gap: 10, transition: "border-color 0.15s" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 14, color: "#0F172A", fontFamily: "inherit" }}
        />
        {right}
      </div>
    </div>
  )
}

// ─── Auth: Login ──────────────────────────────────────────────────────────────

function LoginScreen({ onBack, onForgot, onSuccess, onSignup }: { onBack: () => void; onForgot: () => void; onSuccess: () => void; onSignup: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = () => {
    if (!email || !password) { setError("Please fill in all fields."); return }
    setError("")
    setLoading(true)
    setTimeout(() => { setLoading(false); onSuccess() }, 1200)
  }

  const EyeIcon = () => (
    <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8", flexShrink: 0 }}>
      {showPw
        ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9C2 9 4.5 4 9 4C13.5 4 16 9 16 9C16 9 13.5 14 9 14C4.5 14 2 9 2 9Z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 3L15 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
        : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9C2 9 4.5 4 9 4C13.5 4 16 9 16 9C16 9 13.5 14 9 14C4.5 14 2 9 2 9Z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /></svg>
      }
    </button>
  )

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8FAFC", overflow: "hidden" }}>
      {/* Dark header band */}
      <div style={{ background: "#7EC8E3", padding: "16px 20px 32px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#1E5F7A", marginBottom: 20, padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Back</span>
        </button>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 4 }}>Welcome back</div>
        <div style={{ fontSize: 13, color: "#1E5F7A" }}>Sign in to continue to LINC</div>
      </div>

      {/* Form card */}
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#7EC8E3", marginBottom: 16 }}>{error}</div>
        )}
        <AuthInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoFocus />
        <AuthInput label="Password" type={showPw ? "text" : "password"} placeholder="Enter your password" value={password} onChange={setPassword} right={<EyeIcon />} />

        <div style={{ textAlign: "right", marginBottom: 24, marginTop: -6 }}>
          <button onClick={onForgot} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#7EC8E3", fontWeight: 600, fontFamily: "inherit" }}>Forgot password?</button>
        </div>

        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: loading ? "#94A3B8" : "#0F172A", color: "#fff", border: "none", borderRadius: 14, padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", fontFamily: "inherit", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: `dot-pulse 1.2s ${i * 0.2}s infinite` }} />)}
          </> : "Sign In"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          <span style={{ fontSize: 11.5, color: "#94A3B8", fontWeight: 500 }}>or continue with</span>
          <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
        </div>

        {/* Social login */}
        <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
          {[
            { label: "Google", icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.48h4.844c-.209 1.128-.844 2.082-1.796 2.718v2.258h2.908C16.627 14.046 17.64 11.793 17.64 9.2z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.805 5.956-2.182l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.71H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71C3.784 10.17 3.682 9.593 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.164 6.656 3.58 9 3.58z" fill="#EA4335"/></svg> },
            { label: "Apple", icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M14.047 9.595c-.016-1.786 1.46-2.646 1.527-2.69-1.06-1.547-2.702-1.757-3.273-1.774-1.386-.143-2.718.826-3.423.826-.718 0-1.808-.809-2.977-.785C4.26 5.202 2.803 6.09 2.007 7.5c-1.614 2.814-.41 6.966 1.15 9.245.775 1.113 1.689 2.356 2.889 2.31 1.163-.048 1.599-.745 3.005-.745 1.395 0 1.793.745 3.012.72 1.252-.022 2.039-1.127 2.8-2.246.896-1.28 1.261-2.536 1.277-2.601-.028-.012-2.438-.939-2.463-3.73-.02-2.33 1.901-3.453 1.99-3.513L14.047 9.595z" fill="#0F172A"/><path d="M11.574 3.58c.637-.784 1.068-1.86.95-2.944-.92.038-2.05.62-2.711 1.387-.589.683-1.111 1.786-.974 2.836 1.032.08 2.093-.527 2.735-1.28z" fill="#0F172A"/></svg> },
          ].map(social => (
            <button key={social.label} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "11px 0", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155", fontFamily: "inherit" }}>
              {social.icon}
              {social.label}
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", fontSize: 13, color: "#64748B" }}>
          {"Don't have an account? "}
          <button onClick={onSignup} style={{ background: "none", border: "none", cursor: "pointer", color: "#7EC8E3", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>Sign Up</button>
        </div>
      </div>
    </div>
  )
}

// ─── Auth: Sign Up ────────────────────────────────────────────────────────────

function SignupScreen({ onBack, onSuccess, onLogin }: { onBack: () => void; onSuccess: () => void; onLogin: () => void }) {
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<"client" | "provider">("client")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleStep1 = () => {
    if (!name || !email || !phone) { setError("Please fill in all fields."); return }
    setError(""); setStep(2)
  }

  const handleStep2 = () => {
    if (!password || !confirmPw) { setError("Please fill in all fields."); return }
    if (password !== confirmPw) { setError("Passwords do not match."); return }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return }
    setError(""); setStep(3)
  }

  const handleFinish = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onSuccess() }, 1400)
  }

  const EyeIcon = () => (
    <button onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94A3B8" }}>
      {showPw
        ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9C2 9 4.5 4 9 4C13.5 4 16 9 16 9C16 9 13.5 14 9 14C4.5 14 2 9 2 9Z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 3L15 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
        : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9C2 9 4.5 4 9 4C13.5 4 16 9 16 9C16 9 13.5 14 9 14C4.5 14 2 9 2 9Z" stroke="currentColor" strokeWidth="1.4" /><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" /></svg>
      }
    </button>
  )

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8FAFC", overflow: "hidden" }}>
      <div style={{ background: "#7EC8E3", padding: "16px 20px 28px" }}>
        <button onClick={step === 1 ? onBack : () => { setStep(s => s - 1); setError("") }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.75)", marginBottom: 20, padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Back</span>
        </button>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 4 }}>
          {step === 1 ? "Create Account" : step === 2 ? "Set Password" : "Your Role"}
        </div>
        <div style={{ fontSize: 13, color: "#1E5F7A", marginBottom: 18 }}>
          {step === 1 ? "Tell us a bit about yourself" : step === 2 ? "Keep your account secure" : "How will you use LINC?"}
        </div>
        {/* Step progress */}
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? "#0F172A" : "rgba(0,0,0,0.15)" }} />
          ))}
        </div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: "#7EC8E3", marginBottom: 16 }}>{error}</div>
        )}

        {step === 1 && <>
          <AuthInput label="Full Name" placeholder="Yonas Molla" value={name} onChange={setName} autoFocus />
          <AuthInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6 }}>Phone Number</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 13, padding: "12px 14px", fontSize: 14, color: "#334155", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <span>🇪🇹</span>
                <span>+251</span>
              </div>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="91 123 4567" style={{ flex: 1, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 13, padding: "12px 14px", fontSize: 14, color: "#0F172A", outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>
          <button onClick={handleStep1} style={{ width: "100%", background: "#0F172A", color: "#fff", border: "none", borderRadius: 14, padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8, marginBottom: 24 }}>
            Continue →
          </button>
          <div style={{ textAlign: "center", fontSize: 13, color: "#64748B" }}>
            {"Already have an account? "}
            <button onClick={onLogin} style={{ background: "none", border: "none", cursor: "pointer", color: "#7EC8E3", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>Sign In</button>
          </div>
        </>}

        {step === 2 && <>
          <AuthInput label="Password" type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={setPassword} autoFocus right={<EyeIcon />} />
          <AuthInput label="Confirm Password" type={showPw ? "text" : "password"} placeholder="Repeat password" value={confirmPw} onChange={setConfirmPw} />
          {/* Strength meter */}
          {password.length > 0 && (
            <div style={{ marginBottom: 20, marginTop: -4 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {[1, 2, 3, 4].map(i => {
                  const strength = Math.min(4, Math.floor(password.length / 3))
                  return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? (strength <= 1 ? "#EF4444" : strength <= 2 ? "#F59E0B" : "#10B981") : "#E2E8F0" }} />
                })}
              </div>
              <span style={{ fontSize: 11, color: password.length < 4 ? "#EF4444" : password.length < 8 ? "#F59E0B" : "#10B981", fontWeight: 500 }}>
                {password.length < 4 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}
              </span>
            </div>
          )}
          <button onClick={handleStep2} style={{ width: "100%", background: "#0F172A", color: "#fff", border: "none", borderRadius: 14, padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>
            Continue →
          </button>
        </>}

        {step === 3 && <>
          <div style={{ marginBottom: 24 }}>
            {([
              { id: "client" as const, icon: "👤", title: "I need services", desc: "Find verified providers for repairs, cleaning, tutoring, and more." },
              { id: "provider" as const, icon: "💼", title: "I offer services", desc: "List your skills, get discovered, and manage bookings — all in one place." },
            ] as const).map(opt => (
              <button key={opt.id} onClick={() => setMode(opt.id)} style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 14, padding: "16px", background: mode === opt.id ? "#FEF2F2" : "#fff", border: `1.5px solid ${mode === opt.id ? "#7EC8E3" : "#E2E8F0"}`, borderRadius: 14, marginBottom: 10, cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: mode === opt.id ? "#7EC8E3" : "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{opt.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: mode === opt.id ? "#7EC8E3" : "#0F172A", marginBottom: 4 }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{opt.desc}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${mode === opt.id ? "#7EC8E3" : "#CBD5E1"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  {mode === opt.id && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#7EC8E3" }} />}
                </div>
              </button>
            ))}
            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "11px 14px", marginTop: 4 }}>
              <p style={{ fontSize: 12, color: "#92400E", margin: 0, lineHeight: 1.5 }}>
                💡 <span style={{ fontWeight: 600 }}>You can switch modes anytime.</span> A single account lets you be a client and a provider.
              </p>
            </div>
          </div>
          <button onClick={handleFinish} disabled={loading} style={{ width: "100%", background: loading ? "#94A3B8" : "#0F172A", color: "#fff", border: "none", borderRadius: 14, padding: "15px 0", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: `dot-pulse 1.2s ${i * 0.2}s infinite` }} />)}
            </> : "Create My Account"}
          </button>
        </>}
      </div>
    </div>
  )
}

// ─── Auth: Forgot Password ────────────────────────────────────────────────────

function ForgotScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSend = () => {
    if (!email) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1000)
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8FAFC", overflow: "hidden" }}>
      <div style={{ background: "#7EC8E3", padding: "16px 20px 32px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#1E5F7A", marginBottom: 20, padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Back to Sign In</span>
        </button>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 4 }}>Forgot Password?</div>
        <div style={{ fontSize: 13, color: "#1E5F7A" }}>{"We'll send a reset link to your email"}</div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "28px 20px" }}>
        {!sent ? <>
          <div style={{ background: "#FEF2F2", borderRadius: 14, padding: "18px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#7EC8E3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2" stroke="white" strokeWidth="1.5" /><path d="M2 7L10 12L18 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#3730A3", marginBottom: 2 }}>Reset by email</div>
              <div style={{ fontSize: 11.5, color: "#7EC8E3" }}>{"We'll send a link to reset your password"}</div>
            </div>
          </div>
          <AuthInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoFocus />
          <button onClick={handleSend} disabled={loading || !email} style={{ width: "100%", background: !email || loading ? "#E2E8F0" : "#7EC8E3", color: !email || loading ? "#94A3B8" : "#fff", border: "none", borderRadius: 14, padding: "15px 0", fontSize: 15, fontWeight: 800, cursor: !email || loading ? "default" : "pointer", fontFamily: "inherit", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <>{[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#94A3B8", animation: `dot-pulse 1.2s ${i * 0.2}s infinite` }} />)}</> : "Send Reset Link"}
          </button>
        </> : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12L10 18L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 8, letterSpacing: "-0.01em" }}>Check your inbox</div>
            <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 28 }}>
              {"Sent to "}
              <span style={{ fontWeight: 700, color: "#334155" }}>{email}</span>
              {". Check spam if you don't see it."}
            </p>
            <button onClick={onBack} style={{ background: "#0F172A", color: "#fff", border: "none", borderRadius: 12, padding: "13px 36px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

function BottomNav({ activeScreen, goToTab }: { activeScreen: Screen; goToTab: (s: Screen) => void }) {
  const items: { id: Screen; label: string; icon: (a: boolean) => React.ReactNode }[] = [
    {
      id: "home", label: "Home",
      icon: a => <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 10.5L11 3L19 10.5V19.5C19 20.05 18.55 20.5 18 20.5H14V15H8V20.5H4C3.45 20.5 3 20.05 3 19.5V10.5Z" fill={a ? "#7EC8E3" : "none"} stroke={a ? "#7EC8E3" : "#94A3B8"} strokeWidth="1.6" strokeLinejoin="round" /></svg>,
    },
    {
      id: "messages", label: "Chat",
      icon: a => <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 3.5H19C19.55 3.5 20 3.95 20 4.5V14.5C20 15.05 19.55 15.5 19 15.5H7.5L3 20V4.5C3 3.95 3.45 3.5 4 3.5H3Z" fill={a ? "#7EC8E3" : "none"} stroke={a ? "#7EC8E3" : "#94A3B8"} strokeWidth="1.6" strokeLinejoin="round" /></svg>,
    },
    {
      id: "bookings", label: "Bookings",
      icon: a => <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="4.5" width="16" height="15" rx="2.5" fill={a ? "#7EC8E3" : "none"} stroke={a ? "#7EC8E3" : "#94A3B8"} strokeWidth="1.6" /><path d="M7 2.5V5.5M15 2.5V5.5M3 9H19" stroke={a ? "#fff" : "#94A3B8"} strokeWidth="1.6" strokeLinecap="round" /></svg>,
    },
    {
      id: "profile", label: "Me",
      icon: a => <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.5" fill={a ? "#7EC8E3" : "none"} stroke={a ? "#7EC8E3" : "#94A3B8"} strokeWidth="1.6" /><path d="M4 19.5C4 16.19 7.13 13.5 11 13.5C14.87 13.5 18 16.19 18 19.5" stroke={a ? "#7EC8E3" : "#94A3B8"} strokeWidth="1.6" strokeLinecap="round" /></svg>,
    },
  ]

  return (
    <div style={{ background: "#fff", borderTop: "1px solid #E2E8F0", padding: "6px 0 20px", display: "flex", alignItems: "stretch", flexShrink: 0 }}>
      {/* Left group */}
      {items.slice(0, 2).map(item => (
        <button key={item.id} onClick={() => goToTab(item.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", fontFamily: "inherit" }}>
          {item.icon(activeScreen === item.id)}
          <span style={{ fontSize: 10, fontWeight: activeScreen === item.id ? 800 : 600, color: activeScreen === item.id ? "#7EC8E3" : "#94A3B8" }}>{item.label}</span>
        </button>
      ))}

      {/* AI center button */}
      <button onClick={() => goToTab("ai")} style={{ flex: 1.2, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "0 0 0", fontFamily: "inherit" }}>
        <div style={{ width: 46, height: 46, borderRadius: 15, background: activeScreen === "ai" ? "linear-gradient(135deg, #4338CA, #0891B2)" : "linear-gradient(135deg, #7EC8E3, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginTop: -10, boxShadow: activeScreen === "ai" ? "0 4px 18px rgba(79,70,229,0.5)" : "0 3px 10px rgba(79,70,229,0.3)" }}>✨</div>
        <span style={{ fontSize: 10, fontWeight: 800, color: activeScreen === "ai" ? "#7EC8E3" : "#94A3B8" }}>AI</span>
      </button>

      {/* Right group */}
      {items.slice(2).map(item => (
        <button key={item.id} onClick={() => goToTab(item.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", fontFamily: "inherit" }}>
          {item.icon(activeScreen === item.id)}
          <span style={{ fontSize: 10, fontWeight: activeScreen === item.id ? 800 : 600, color: activeScreen === item.id ? "#7EC8E3" : "#94A3B8" }}>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
