"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCheck,
  Search,
  ArrowLeft,
  Loader2,
  Home,
  RefreshCw,
} from "lucide-react";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import Link from "next/link";

interface ConversationItem {
  id: string;
  propertyId?: string | null;
  otherUser: {
    id: string;
    name: string;
    image?: string | null;
    phone?: string | null;
  } | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
}

interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image?: string | null;
  };
}

function MessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramConversationId = searchParams.get("conversationId");
  const paramRecipientId = searchParams.get("recipientId");

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(paramConversationId);
  const [activeOtherUser, setActiveOtherUser] = useState<{ id: string; name: string; image?: string | null } | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch conversations list
  const loadConversations = useCallback(async (selectFirst: boolean = false) => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);

        if (selectFirst && !activeConversationId && data.conversations.length > 0) {
          const first = data.conversations[0];
          setActiveConversationId(first.id);
          setActiveOtherUser(first.otherUser);
        }
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [session?.user, activeConversationId]);

  // 2. Fetch messages for active conversation
  const loadActiveMessages = useCallback(async (convId: string) => {
    if (!session?.user) return;
    try {
      const res = await fetch(`/api/messages?conversationId=${convId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.conversation) {
        setMessages(data.conversation.messages || []);
        const other = data.conversation.participants?.find((p: any) => p.userId !== session.user.id);
        if (other?.user) {
          setActiveOtherUser(other.user);
        }
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  }, [session?.user]);

  // Handle incoming conversationId or recipientId from URL
  useEffect(() => {
    if (paramConversationId) {
      setActiveConversationId(paramConversationId);
    } else if (paramRecipientId) {
      // Find or initiate conversation with recipientId
      fetch(`/api/messages?recipientId=${paramRecipientId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.conversationId) {
            setActiveConversationId(d.conversationId);
            setMessages(d.messages || []);
            const other = d.conversation?.participants?.find((p: any) => p.userId !== session?.user?.id);
            if (other?.user) setActiveOtherUser(other.user);
          }
        });
    }
  }, [paramConversationId, paramRecipientId, session?.user?.id]);

  // Load conversations on mount
  useEffect(() => {
    if (session?.user) {
      loadConversations(true);
    }
  }, [session?.user, loadConversations]);

  // When activeConversationId changes, load its message thread
  useEffect(() => {
    if (activeConversationId) {
      setIsLoadingMessages(true);
      loadActiveMessages(activeConversationId).finally(() => {
        setIsLoadingMessages(false);
        setTimeout(scrollToBottom, 100);
      });

      // Clear previous poll and start 3.5s background poll for active chat
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(() => {
        loadActiveMessages(activeConversationId);
      }, 3500);
    }

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [activeConversationId, loadActiveMessages]);

  // Listen to window real-time message event from RealtimeProvider
  useEffect(() => {
    const handleRealtimeMessage = (e: Event) => {
      const customEvent = e as CustomEvent;
      const payload = customEvent.detail;
      if (!payload) return;

      // If active conversation matches, append message immediately
      if (activeConversationId && payload.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.messageId)) return prev;
          return [
            ...prev,
            {
              id: payload.messageId,
              senderId: payload.senderId,
              content: payload.content,
              createdAt: payload.createdAt,
              sender: {
                id: payload.senderId,
                name: payload.senderName,
                image: payload.senderImage,
              },
            },
          ];
        });
        setTimeout(scrollToBottom, 60);
      }

      // Refresh conversation list to update last message preview and order
      loadConversations(false);
    };

    window.addEventListener("ethiohome:new-message", handleRealtimeMessage);
    return () => {
      window.removeEventListener("ethiohome:new-message", handleRealtimeMessage);
    };
  }, [activeConversationId, loadConversations]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !session?.user || isSending) return;

    const messageContent = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    // Optimistic message append
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageItem = {
      id: tempId,
      senderId: session.user.id,
      content: messageContent,
      createdAt: new Date().toISOString(),
      sender: {
        id: session.user.id,
        name: session.user.name || "You",
        image: session.user.image,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId || undefined,
          recipientId: activeOtherUser?.id || undefined,
          content: messageContent,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to send message");
        // Remove optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }

      // Update activeConversationId if this was newly created
      if (!activeConversationId && data.message?.conversationId) {
        setActiveConversationId(data.message.conversationId);
      }

      // Replace temp message with persisted message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? (data.message as MessageItem) : m))
      );

      // Refresh conversations list
      loadConversations(false);
    } catch {
      toast.error("Failed to send message. Please check your connection.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.otherUser?.name?.toLowerCase() || "";
    const msg = c.lastMessage?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || msg.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Messages</h1>
            <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" title="Live Socket Streaming Active" />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time direct communication between Ethiopian hosts and guests
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsLoadingConversations(true);
            loadConversations(false);
            if (activeConversationId) loadActiveMessages(activeConversationId);
          }}
          className="self-start sm:self-auto text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="h-[700px] rounded-3xl border border-border/80 bg-card overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-xl">
        {/* Left Column: Conversations List */}
        <div
          className={`md:col-span-4 border-r border-border/60 flex flex-col bg-secondary/20 ${
            activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search Bar */}
          <div className="p-4 border-b border-border/60 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/80 bg-background/80 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {isLoadingConversations ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-xs gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                Loading conversations...
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setActiveOtherUser(conv.otherUser);
                      router.push(`/account/messages?conversationId=${conv.id}`, { scroll: false });
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                      isActive
                        ? "bg-primary/10 border-primary/40 shadow-xs"
                        : "border-transparent hover:bg-secondary/60"
                    }`}
                  >
                    <div className="relative">
                      <Avatar
                        src={conv.otherUser?.image}
                        name={conv.otherUser?.name || "EthioHome User"}
                        size="md"
                      />
                      {conv.unread && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`font-bold text-sm truncate ${
                            conv.unread ? "text-foreground font-black" : "text-foreground"
                          }`}
                        >
                          {conv.otherUser?.name || "EthioHome User"}
                        </h4>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {conv.lastMessageAt
                            ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          conv.unread ? "text-foreground font-bold" : "text-muted-foreground"
                        }`}
                      >
                        {conv.lastMessage || "Tap to chat"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-foreground">No conversations yet</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Start an inquiry from any listing or book a stay to chat live with Ethiopian hosts.
                </p>
                <Link href="/search" className="inline-block pt-1">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Home className="w-3.5 h-3.5 mr-1.5" /> Explore Stays
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Thread */}
        <div
          className={`md:col-span-8 flex flex-col justify-between bg-card ${
            !activeConversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {activeConversationId ? (
            <>
              {/* Header */}
              <div className="p-4 px-6 border-b border-border/60 flex items-center justify-between bg-card/80 backdrop-blur-xs">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveConversationId(null)}
                    className="md:hidden -ml-2 text-muted-foreground"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar
                    src={activeOtherUser?.image}
                    name={activeOtherUser?.name || "Participant"}
                    size="md"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {activeOtherUser?.name || "EthioHome Host"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified Account
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Live
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/30">
                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                    Loading message history...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((m) => {
                    const isMe = m.senderId === session?.user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-150`}
                      >
                        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                          {!isMe && (
                            <Avatar
                              src={m.sender?.image}
                              name={m.sender?.name || "Host"}
                              size="sm"
                              className="shrink-0 mb-1"
                            />
                          )}
                          <div
                            className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-card text-foreground rounded-bl-none border border-border/70"
                            }`}
                          >
                            <p className="whitespace-pre-line">{m.content}</p>
                          </div>
                        </div>

                        <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isMe && <CheckCheck className="w-3 h-3 text-primary" />}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-foreground">Start the conversation!</h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Send a message below to coordinate dates, arrival times, airport transfers, or ask questions.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-border/60 flex items-center gap-2 bg-card"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${activeOtherUser?.name ? activeOtherUser.name.split(" ")[0] : "the host"}...`}
                  className="flex-1 h-12 px-4 rounded-2xl border border-border/80 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputMessage.trim() || isSending}
                  className="h-12 w-12 rounded-2xl font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-secondary/60 flex items-center justify-center text-muted-foreground">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-base text-foreground">Select a conversation</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Choose a conversation from the left to view message history and chat in real time with property owners and renters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
