"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Loader2, ShieldCheck, Sparkles, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HostChatModalProps {
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  hostId: string;
  hostName: string;
  hostImage?: string | null;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  buttonText?: string;
  className?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string | Date;
  sender?: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export function HostChatModal({
  propertyId,
  propertyTitle,
  propertySlug,
  hostId,
  hostName,
  hostImage,
  buttonVariant = "outline",
  buttonText = "Chat with Host",
  className,
}: HostChatModalProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSelf = session?.user?.id === hostId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!session?.user || !hostId) return;
    try {
      const res = await fetch(`/api/messages?recipientId=${hostId}&propertyId=${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch {
      // Background poll failure silent
    }
  };

  useEffect(() => {
    if (!isOpen || !session?.user) return;

    setIsLoading(true);
    fetchMessages().finally(() => {
      setIsLoading(false);
      setTimeout(scrollToBottom, 150);
    });

    // Real-time polling while chat window is active
    const pollInterval = setInterval(fetchMessages, 3500);

    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.senderId === hostId) {
        fetchMessages();
      }
    };

    window.addEventListener("ethiohome:new-message", handleRealtime);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("ethiohome:new-message", handleRealtime);
    };
  }, [isOpen, session?.user, hostId, propertyId]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, isOpen]);

  const handleOpen = () => {
    if (!session?.user) {
      toast.info("Please sign in to message the host", {
        action: {
          label: "Sign In",
          onClick: () => router.push(`/login?redirect=/property/${propertySlug}`),
        },
      });
      return;
    }

    if (isSelf) {
      toast.info("This is your own listing!");
      return;
    }

    setIsOpen(true);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputMessage.trim();
    if (!content || isSending) return;

    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: session?.user?.id || "",
      content,
      createdAt: new Date(),
      sender: {
        id: session?.user?.id || "",
        name: session?.user?.name || "You",
        image: session?.user?.image,
      },
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage("");
    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: hostId,
          propertyId,
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send");
      }

      // Refresh real thread
      fetchMessages();
    } catch (err: unknown) {
      toast.error("Failed to deliver message. Please retry.");
    } finally {
      setIsSending(false);
    }
  };

  const quickQuestions = [
    "Selam! Is this home available for my stay?",
    "Can you confirm standby generator backup?",
    "What is the Wi-Fi speed at the property?",
    "Is early check-in possible?",
  ];

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        onClick={handleOpen}
        className={className}
      >
        <MessageSquare className="w-4 h-4 mr-2 text-primary" />
        {buttonText}
      </Button>

      {/* Real-time Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg h-[640px] max-h-[92vh] rounded-3xl border border-border/80 bg-card flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Chat Header */}
            <div className="p-4 sm:p-5 border-b border-border/60 bg-secondary/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar src={hostImage} name={hostName} size="md" className="ring-2 ring-primary/30" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-card" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    {hostName}
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Host of <span className="font-medium text-foreground">{propertyTitle}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href="/account/messages"
                  title="Open in full inbox"
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-card">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs">Connecting to host chat...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Message {hostName}</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Ask about availability, standby power, airport pickup, or booking arrangements.
                    </p>
                  </div>

                  {/* Quick Inquiry Buttons */}
                  <div className="w-full space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block text-left">
                      Quick Questions:
                    </span>
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInputMessage(q);
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-border/70 hover:border-primary/50 bg-secondary/30 hover:bg-secondary text-xs text-foreground transition-all"
                      >
                        &ldquo;{q}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === session?.user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-xs font-medium"
                            : "bg-secondary text-secondary-foreground rounded-bl-xs border border-border/60"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts strip when chatting */}
            {messages.length > 0 && (
              <div className="px-4 py-2 bg-secondary/20 border-t border-border/40 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <span className="text-muted-foreground shrink-0 text-[10px] font-bold uppercase">Quick:</span>
                {quickQuestions.slice(0, 2).map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputMessage(q)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-secondary text-foreground hover:bg-secondary/80 border border-border/60 text-[11px]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-border/60 bg-card flex items-center gap-2">
              <input
                type="text"
                placeholder={`Message ${hostName}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSending}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-border/80 bg-secondary/30 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputMessage.trim() || isSending}
                className="rounded-2xl px-4 font-bold bg-primary text-primary-foreground shadow-xs shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1" /> Send
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
