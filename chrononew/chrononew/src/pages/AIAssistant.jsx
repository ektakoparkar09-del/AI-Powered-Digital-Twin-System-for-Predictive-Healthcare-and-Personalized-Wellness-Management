const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { calculateHealthScore, getAllDiseaseRisks, calculateBMI } from "@/lib/healthUtils";
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

const quickQuestions = [
  "Explain my health score to me",
  "Why is my disease risk high?",
  "Suggest a diet plan for me",
  "What exercise should I do?",
  "Suggest a meditation for stress",
  "How can I sleep better?",
  "Give me daily motivation",
  "How do I lower my blood pressure?",
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });

  const profile = profiles?.[0];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let context = "No health profile available.";
    if (profile) {
      const score = calculateHealthScore(profile);
      const riskList = getAllDiseaseRisks(profile);
      const riskSummary = riskList.map((r) => `${r.label} ${r.value}%`).join(", ");
      context = `Patient Profile: Age ${profile.age}, Gender ${profile.gender}, BMI ${profile.bmi || calculateBMI(profile.weight_kg, profile.height_cm)}, BP ${profile.blood_pressure_systolic}/${profile.blood_pressure_diastolic}, Blood Sugar ${profile.blood_sugar}, Cholesterol ${profile.cholesterol}, Heart Rate ${profile.heart_rate}, Exercise ${profile.exercise_frequency}, Sleep ${profile.sleep_hours}h, Diet ${profile.diet_type}, Smoking ${profile.smoking}, Alcohol ${profile.alcohol}, Stress ${profile.stress_level}, Existing diseases: ${(profile.existing_diseases || []).join(", ") || "None"}, Family history: ${(profile.family_history || []).join(", ") || "None"}, Medications: ${(profile.medications || []).join(", ") || "None"}. Health Score: ${score}/100. Chronic disease risks (0-95): ${riskSummary}.`;
    }

    const chatHistory = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n");

    const res = await db.integrations.Core.InvokeLLM({
      prompt: `You are ChronoTwin-X AI Health Coach, a friendly, knowledgeable, and motivating healthcare AI companion. You have access to the user's digital twin data and can:

- Explain the user's Health Score and what factors affect it
- Explain Disease Risk predictions and what drives them
- Suggest personalized diet plans
- Suggest personalized exercise routines
- Suggest meditation and mindfulness practices
- Suggest better sleep habits
- Answer follow-up questions using context from the previous conversation
- Provide daily motivation and encouragement

User health context:
${context}

Previous conversation (use this to remember what was discussed and answer follow-ups):
${chatHistory}

User asks: ${text}

Provide helpful, personalized, specific advice with actionable recommendations. Use markdown formatting (headings, bullet lists, bold) for clarity. Be warm and motivating. End with a brief disclaimer that this is AI-generated guidance and they should consult a healthcare professional for medical decisions.`,
    });

    setMessages(prev => [...prev, { role: "assistant", content: res }]);
    setLoading(false);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">AI Health Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Ask anything about your health — powered by AI</p>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold font-heading mb-2">Hello! I'm your AI Health Assistant</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Ask me anything about your health, disease risks, diet, exercise, or wellness. I have access to your Digital Twin data.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {quickQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                  >
                    <Sparkles className="w-3 h-3 text-primary inline mr-1.5" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user" 
                    ? "gradient-primary text-white" 
                    : "bg-muted/70 border border-border/50"
                }`}>
                  {msg.role === "user" ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:my-1 prose-li:my-0.5 prose-headings:my-2">
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted/70 border border-border/50 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your health..."
              className="flex-1 rounded-xl bg-muted/50"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="gradient-primary text-white rounded-xl w-10 h-10" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}