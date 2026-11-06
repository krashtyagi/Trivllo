"use client"

import * as React from "react"
import { MoreHorizontal, Paperclip, Search, Send, X, ExternalLink, FileText, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

// --- Dummy Data ---
const USERS = [
  { id: "1", name: "Alice Johnson", lastMsg: "Can I request a late check-out?", time: "09:15 AM", unread: 0, color: "bg-violet-500" },
  { id: "2", name: "Michael Brown", lastMsg: "The air conditioning in my room...", time: "09:30 AM", unread: 1, color: "bg-emerald-200" },
  { id: "3", name: "Emily Davis", lastMsg: "Can you confirm my airport pickup?", time: "09:45 AM", unread: 3, color: "bg-violet-500" },
]

const INITIAL_MESSAGES = [
  { id: "m1", sender: "Alice Johnson", text: "Can I request a late check-out for Room 305?", time: "9:15 PM", isMe: false },
  { id: "m2", sender: "Me", text: "Hi Alice, we can accommodate a late check-out for you. How late would you like to stay?", time: "9:20 PM", isMe: true },
  { id: "m3", sender: "Alice Johnson", text: "I was hoping to stay until 2 PM. Is that possible?", time: "9:22 PM", isMe: false },
  { id: "m4", sender: "Me", text: "Let me check the availability for Room 305. One moment, please.", time: "9:25 PM", isMe: true },
  { id: "m5", sender: "Me", text: "Good news, Alice! We can extend your check-out time to 2 PM.", time: "9:30 PM", isMe: true },
]

// --- Components ---

export default function ChatDashboard() {
  const [messages, setMessages] = React.useState(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = React.useState("")

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    const newMsg = {
      id: Date.now().toString(),
      sender: "Me",
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }
    setMessages([...messages, newMsg])
    setInputValue("")
  }

  return (
    <div className="flex h-[800px] w-full max-w-7xl mx-auto border rounded-3xl overflow-hidden bg-background font-sans">
      
      {/* 1. Left Sidebar: Contacts */}
      <aside className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 bg-foreground-50 border-none rounded-xl" placeholder="Search name, chat, etc" />
            <Button size="icon" className="absolute right-0 top-0 bg-violet-600 rounded-xl h-10 w-10">
              <Search className="h-4 w-4 text-text" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          {USERS.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer border-l-4 border-transparent hover:border-violet-600">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={`${user.color} text-text font-bold`}>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-sm truncate">{user.name}</h4>
                  <span className="text-[10px] text-muted-foreground">{user.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.lastMsg}</p>
              </div>
              {user.unread > 0 && (
                <Badge className="bg-red-500 h-5 w-5 flex items-center justify-center p-0 rounded-full">{user.unread}</Badge>
              )}
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* 2. Main Chat Area */}
      <main className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <header className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-violet-500 text-text font-bold">AJ</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-sm">Alice Johnson</h3>
              <p className="text-[10px] text-muted-foreground">last seen recently</p>
            </div>
          </div>
          <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5 text-muted-foreground" /></Button>
        </header>

        {/* Messages Container */}
        <ScrollArea className="flex-1 p-6 bg-background  overflow-y-auto">
          <div className="text-center mb-6">
            <span className="text-[10px] bg-card px-3 py-1 rounded-full text-muted-foreground shadow-sm">Today, June 19</span>
          </div>
          
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={msg.isMe ? "bg-emerald-100" : "bg-violet-500 text-text"}>
                    {msg.sender[0]}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[70%] space-y-1 ${msg.isMe ? "items-end" : "items-start"}`}>
                  <div className={`p-4 text-sm shadow-sm ${
                    msg.isMe 
                    ? "bg-violet-600 text-text rounded-2xl rounded-tr-none" 
                    : "bg-emerald-50 text-slate-800 rounded-2xl rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Footer */}
        <footer className="p-4 bg-[#F8F9FB]">
          <div className="relative flex items-center gap-2 bg-card rounded-2xl p-2 shadow-sm border">
            <Button variant="ghost" size="icon" className="text-muted-foreground"><Paperclip className="h-5 w-5" /></Button>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message.." 
              className="border-none focus-visible:ring-0 shadow-none text-sm" 
            />
            <Button onClick={handleSendMessage} className="bg-violet-600 hover:bg-violet-700 rounded-xl h-10 w-10">
              <Send className="h-4 w-4 text-text" />
            </Button>
          </div>
        </footer>
      </main>

      {/* 3. Right Profile Sidebar */}
      <aside className="w-80 border-l bg-card flex flex-col p-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold">Profile</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-violet-100 text-violet-600 border-none px-3 py-1">Popular</Badge>
            <X className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </div>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="/girl.png" />
            <AvatarFallback className="bg-violet-500 text-white text-3xl font-bold">AJ</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">Alice Johnson</h2>
          <p className="text-xs text-muted-foreground">G011-987654321</p>
        </div>

        <div className="space-y-6 flex-1 overflow-auto">
          <section>
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
            <p className="text-xs leading-relaxed text-slate-600">A frequent traveler who enjoys luxury accommodations and values exceptional customer service.</p>
          </section>

          <section>
            <div className="flex justify-between mb-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Media (17)</h4>
              <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold">Show All</Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-emerald-50" />
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between mb-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Documents (8)</h4>
              <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold">Show All</Button>
            </div>
            <div className="space-y-2">
              {['Invoice-240528.pdf', 'Invoice-120328.pdf'].map((doc) => (
                <div key={doc} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 group hover:bg-emerald-100 cursor-pointer">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <FileText className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{doc}</p>
                    <p className="text-[10px] text-muted-foreground">1.45 MB</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-violet-600" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}