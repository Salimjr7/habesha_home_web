"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, ShieldCheck, CheckCheck } from "lucide-react";
import { sendMessageAction } from "@/server/actions/message.actions";
import { toast } from "sonner";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState("chat-1");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "m-1",
      sender: "host",
      name: "Dawit Haile",
      content: "Selam Abebe! Welcome to Habesha Home. Let me know what time your flight lands at Bole International Airport so we can coordinate your check-in.",
      time: "10:30 AM",
    },
    {
      id: "m-2",
      sender: "me",
      name: "You",
      content: "Selam Dawit! Thank you so much. My flight lands around 3:00 PM. Is the backup generator working fine?",
      time: "10:35 AM",
    },
    {
      id: "m-3",
      sender: "host",
      name: "Dawit Haile",
      content: "Yes, 100%! We have a 60kVA automatic standby generator and two 5,000L water reserve tanks. We will also prepare the traditional Ethiopian coffee ceremony for your arrival.",
      time: "10:38 AM",
    },
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "me",
      name: "You",
      content: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMsg]);
    setInputMessage("");

    try {
      await sendMessageAction({
        content: newMsg.content,
      });
    } catch {
      // Optimistic UI handled
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Direct communication with your Ethiopian hosts &amp; guests</p>
      </div>

      <div className="h-[650px] rounded-3xl border border-border/80 bg-card overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-xl">
        {/* Left: Conversation List */}
        <div className="md:col-span-4 border-r border-border/60 p-4 space-y-3 bg-secondary/20">
          <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground px-2">
            Recent Conversations
          </div>

          <div
            onClick={() => setActiveChat("chat-1")}
            className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
              activeChat === "chat-1" ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/60"
            }`}
          >
            <Avatar
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
              name="Dawit Haile"
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-foreground truncate">Dawit Haile</h4>
                <span className="text-[10px] text-muted-foreground">10:38 AM</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">Bole Atlas Modern Penthouse</p>
            </div>
          </div>
        </div>

        {/* Right: Active Chat Window */}
        <div className="md:col-span-8 flex flex-col justify-between bg-card">
          {/* Chat Header */}
          <div className="p-4 px-6 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                name="Dawit Haile"
                size="sm"
              />
              <div>
                <h3 className="font-bold text-sm text-foreground">Dawit Haile</h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Host • Bole Atlas
                </span>
              </div>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isMe = m.sender === "me";
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-secondary text-secondary-foreground rounded-bl-none border border-border/60"
                    }`}
                  >
                    <p>{m.content}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    {m.time} {isMe && <CheckCheck className="w-3 h-3 text-primary" />}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border/60 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message to the host..."
              className="flex-1 h-11 px-4 rounded-xl border border-input bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" size="icon" className="h-11 w-11 rounded-xl font-bold">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
