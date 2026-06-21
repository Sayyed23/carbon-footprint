"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useUserActivities } from "@/lib/firebase/hooks";
import Navbar from "@/components/Navbar";
import { 
  Send, 
  Sparkles, 
  Leaf, 
  Calendar, 
  Check, 
  TrendingDown, 
  MessageSquare,
  Bookmark,
  User,
  Compass,
  ArrowRight
} from "lucide-react";

interface Message {
  role: "user" | "coach";
  content: string;
  timestamp: Date;
}

interface Recommendation {
  id: string;
  title: string;
  category: "transport" | "electricity" | "cooking" | "diet" | "consumption";
  impact: string;
  description: string;
  committed: boolean;
}

export default function CarbonCoachPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  
  // Get recent activities to ground the chat context
  const { data: activities = [] } = useUserActivities(user?.uid);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      content: `Namaste! I am your EcoTrace Carbon Coach. 🌿 I have analyzed your profile. How can I help you reduce your carbon footprint today? You can ask me questions like:
- "How can I reduce my electricity bill emissions?"
- "What is the carbon impact of a CNG auto-rickshaw commute vs a petrol car?"
- "What are simple steps to eat more sustainably in India?"`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: "rec1",
      title: "Switch to Metro/Bus Commutes",
      category: "transport",
      impact: "~12 kg CO2e / week",
      description: "Replace three solo petrol car commutes next week with Delhi/Mumbai/Pune metro or bus rides.",
      committed: false
    },
    {
      id: "rec2",
      title: "Limit AC running time",
      category: "electricity",
      impact: "~9 kg CO2e / week",
      description: "Reduce AC usage by 2 hours daily by setting a sleep timer and raising the temperature to 25°C.",
      committed: false
    },
    {
      id: "rec3",
      title: "Try Dairy Alternatives",
      category: "diet",
      impact: "~4 kg CO2e / week",
      description: "Substitute dairy milk/ghee with almond or soy alternatives for coffee and two meals this week.",
      committed: false
    }
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <span className="p-3 bg-primary/10 text-primary rounded-full animate-bounce mb-3">
          <Leaf className="h-8 w-8" />
        </span>
        <p className="text-sm font-semibold tracking-wide text-muted-foreground animate-pulse">Loading Coach...</p>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setSending(true);

    try {
      const updatedMessages = [...messages, userMessage].map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        content: msg.content
      }));

      const res = await fetch("/api/emissions/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          activities,
          profile
        })
      });

      const data = await res.json();
      if (data.response) {
        setMessages(prev => [...prev, {
          role: "coach",
          content: data.response,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.error || "Failed to fetch response");
      }
    } catch (error) {
      console.error("Coach fetch error:", error);
      setMessages(prev => [...prev, {
        role: "coach",
        content: "Oops! I encountered an error connecting to my servers. Please try again in a few moments.",
        timestamp: new Date()
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleCommit = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, committed: !rec.committed } : rec)
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chat Section */}
        <div className="lg:col-span-2 flex flex-col h-[75vh] glass border border-border rounded-2xl shadow-xl overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-6 py-4 bg-muted/40 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-md">AI Carbon Coach</h2>
                <p className="text-xs text-muted-foreground">Ask questions & get advice grounded in your habits</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div 
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div className={`p-2.5 rounded-full shrink-0 h-fit ${isUser ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {isUser ? <User className="h-4 w-4" /> : <Leaf className="h-4 w-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    isUser 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-card border border-border text-foreground rounded-tl-none"
                  }`}>
                    {msg.content}
                    <span className={`block text-[10px] mt-2 text-right ${isUser ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            {sending && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="p-2.5 bg-muted text-muted-foreground rounded-full">
                  <Leaf className="h-4 w-4 animate-spin text-primary" />
                </div>
                <div className="p-4 bg-card border border-border text-muted-foreground rounded-2xl rounded-tl-none text-sm animate-pulse">
                  Analyzing logs and typing recommendations...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-muted/20 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask the Carbon Coach about your lifestyle footprint..."
              disabled={sending}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={sending || !inputValue.trim()}
              className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Weekly Goals & Committed Recommendations */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-border shadow-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" /> Weekly Action Goals
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Commit to personalized, actionable targets to reduce your footprint. Check back next week to verify consistency.
            </p>

            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div 
                  key={rec.id} 
                  className={`p-4 border rounded-xl transition-all ${
                    rec.committed 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-card/50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-bold text-sm tracking-tight">{rec.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase whitespace-nowrap">
                      {rec.impact}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{rec.description}</p>
                  
                  <button
                    onClick={() => handleCommit(rec.id)}
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      rec.committed
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    {rec.committed ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Committed</span>
                      </>
                    ) : (
                      <span>Commit to Goal</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Summary card */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl space-y-3">
            <h4 className="font-bold text-sm text-primary flex items-center gap-1">
              <Compass className="h-4 w-4" /> EcoTip for Indian Grids
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Charging EV scooters/cars between 10 AM and 3 PM matches high solar injection schedules on regional Indian grids, which translates to a lower actual charging carbon intensity!
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
