import { useCallback, useEffect, useRef, useState } from "react";

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
}

export function useTextToSpeech({
  rate = 0.92,
  pitch = 1.0,
  lang = "en-US",
}: UseTextToSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  const speak = useCallback(
    (text: string, messageId?: string) => {
      if (!("speechSynthesis" in window)) return;

      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = lang;

      // Try to find a natural-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("karen") ||
            v.name.toLowerCase().includes("moira") ||
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("natural")),
      );
      if (preferred) {
        utterance.voice = preferred;
      } else {
        const englishVoice = voices.find((v) => v.lang.startsWith("en"));
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageId(messageId ?? null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [rate, pitch, lang],
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  const toggleSpeak = useCallback(
    (text: string, messageId?: string) => {
      if (isSpeaking && speakingMessageId === messageId) {
        stop();
      } else {
        speak(text, messageId);
      }
    },
    [isSpeaking, speakingMessageId, speak, stop],
  );

  return {
    isSpeaking,
    speakingMessageId,
    isSupported,
    speak,
    stop,
    toggleSpeak,
  };
}
