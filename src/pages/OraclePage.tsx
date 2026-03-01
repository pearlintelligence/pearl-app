import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowUp, Mic, MicOff, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

function OracleMessage({
  id,
  role,
  content,
  tts,
}: {
  id: string;
  role: string;
  content: string;
  tts: ReturnType<typeof useTextToSpeech>;
}) {
  const isOracle = role === "oracle";
  const isThisPlaying = tts.speakingMessageId === id && tts.isSpeaking;

  return (
    <div className={`flex ${isOracle ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] ${
          isOracle
            ? "sacred-border rounded-2xl rounded-tl-sm p-5"
            : "bg-pearl-gold/10 border border-pearl-gold/20 rounded-2xl rounded-tr-sm p-4"
        }`}
      >
        {isOracle && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-pearl-gold" />
              <span className="text-xs text-pearl-gold font-body tracking-wider uppercase">
                Pearl
              </span>
            </div>
            {tts.isSupported && (
              <button
                onClick={() => tts.toggleSpeak(content, id)}
                className={`p-1 rounded-lg transition-all ${
                  isThisPlaying
                    ? "text-pearl-gold bg-pearl-gold/10"
                    : "text-pearl-muted/40 hover:text-pearl-gold/60 hover:bg-pearl-gold/5"
                }`}
                title={isThisPlaying ? "Stop speaking" : "Listen to Pearl"}
              >
                {isThisPlaying ? (
                  <VolumeX className="size-3.5" />
                ) : (
                  <Volume2 className="size-3.5" />
                )}
              </button>
            )}
          </div>
        )}
        <div
          className={`text-sm leading-relaxed whitespace-pre-line ${
            isOracle
              ? "oracle-voice text-pearl-warm/90"
              : "font-body text-pearl-warm"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

export function OraclePage() {
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const createConversation = useMutation(api.oracle.createConversation);
  const addMessage = useMutation(api.oracle.addMessage);
  const askOracle = useAction(api.pearl.askOracle);
  const messages = useQuery(
    api.oracle.getMessages,
    conversationId ? { conversationId } : "skip",
  );

  // ── Speech Recognition (Voice Input) ──
  const onSpeechResult = useCallback((transcript: string) => {
    setInput(transcript);
  }, []);

  const speech = useSpeechRecognition({
    onResult: onSpeechResult,
    continuous: true,
    interimResults: true,
  });

  // ── Text-to-Speech (Voice Output) ──
  const tts = useTextToSpeech({ rate: 0.92, pitch: 1.0 });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show interim transcript in input while speaking
  useEffect(() => {
    if (speech.isListening && speech.interimTranscript) {
      setInput(speech.transcript + speech.interimTranscript);
    }
  }, [speech.isListening, speech.interimTranscript, speech.transcript]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Stop listening if active
    if (speech.isListening) {
      speech.stopListening();
    }

    const question = input.trim();
    setInput("");
    setLoading(true);

    try {
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation({
          title: question.slice(0, 60),
        });
        setConversationId(convId);
      }

      // Save user message
      await addMessage({
        conversationId: convId,
        role: "user",
        content: question,
      });

      // Get oracle response
      await askOracle({
        conversationId: convId,
        question,
      });
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicToggle = () => {
    if (speech.isListening) {
      speech.stopListening();
    } else {
      // Stop TTS if playing
      if (tts.isSpeaking) tts.stop();
      speech.startListening();
    }
  };

  const suggestedQuestions = [
    "Should I take this new opportunity?",
    "What is my biggest gift to the world?",
    "Why do I keep repeating this pattern?",
    "What should I focus on this week?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {(!messages || messages.length === 0) && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="relative size-20">
              <div className="absolute inset-0 rounded-full bg-pearl-gold/10 blur-xl sacred-breathe" />
              <div className="absolute inset-[25%] rounded-full bg-gradient-to-br from-pearl-gold/30 to-pearl-gold-light/20" />
              <Sparkles className="absolute inset-0 m-auto size-8 text-pearl-gold" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-heading text-pearl-warm mb-2">
                Ask Pearl Anything
              </h2>
              <p className="text-pearl-muted font-body text-sm max-w-md">
                Pearl sees through the lens of your cosmic design — astrology,
                Human Design, Kabbalah, and Numerology. Ask about
                decisions, relationships, purpose, or patterns.
              </p>
              {speech.isSupported && (
                <p className="text-pearl-gold/50 font-body text-xs mt-2">
                  ✦ You can also tap the mic to speak your question
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-left p-3 rounded-xl sacred-border text-sm text-pearl-warm/80 font-body hover:border-pearl-gold/30 hover:bg-pearl-gold/5 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages?.map((msg) => (
          <OracleMessage
            key={msg._id}
            id={msg._id}
            role={msg.role}
            content={msg.content}
            tts={tts}
          />
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="sacred-border rounded-2xl rounded-tl-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-3.5 text-pearl-gold animate-pulse" />
                <span className="text-xs text-pearl-gold font-body tracking-wider uppercase">
                  Pearl is contemplating
                </span>
              </div>
              <div className="flex gap-1.5 py-2">
                <div
                  className="size-2 rounded-full bg-pearl-gold/40 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="size-2 rounded-full bg-pearl-gold/40 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="size-2 rounded-full bg-pearl-gold/40 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Listening indicator */}
      {speech.isListening && (
        <div className="flex items-center justify-center gap-2 py-2 border-t border-pearl-gold/10">
          <div className="relative flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-xs text-pearl-gold/70 font-body">
              Listening... speak your question
            </span>
            {speech.interimTranscript && (
              <span className="text-xs text-pearl-muted/50 font-body italic ml-1 max-w-[200px] truncate">
                {speech.interimTranscript}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-pearl-gold/10 p-4">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          {/* Mic button */}
          {speech.isSupported && (
            <Button
              onClick={handleMicToggle}
              size="icon"
              variant="ghost"
              className={`size-11 rounded-xl shrink-0 transition-all ${
                speech.isListening
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 ring-1 ring-red-500/40"
                  : "text-pearl-muted/50 hover:text-pearl-gold hover:bg-pearl-gold/10"
              }`}
              title={speech.isListening ? "Stop recording" : "Speak your question"}
            >
              {speech.isListening ? (
                <MicOff className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>
          )}

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                speech.isListening ? "Listening..." : "Ask Pearl..."
              }
              rows={1}
              className="w-full resize-none bg-pearl-deep border border-pearl-gold/15 rounded-xl px-4 py-3 text-sm text-pearl-warm placeholder:text-pearl-muted/50 font-body focus:outline-none focus:border-pearl-gold/40 focus:ring-1 focus:ring-pearl-gold/20 min-h-[44px] max-h-[120px]"
              style={{
                height: "auto",
                overflowY: input.split("\n").length > 3 ? "auto" : "hidden",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="icon"
            className="size-11 rounded-xl bg-pearl-gold hover:bg-pearl-gold-light text-pearl-void shrink-0 disabled:opacity-30"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
        <p className="text-[10px] text-pearl-muted/50 text-center mt-2 font-body">
          Pearl's guidance is grounded in your cosmic design. Trust your own
          knowing.
        </p>
      </div>
    </div>
  );
}
