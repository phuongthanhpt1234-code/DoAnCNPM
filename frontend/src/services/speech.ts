import { Audio } from "expo-av";
import { Platform } from "react-native";

let currentSound: Audio.Sound | null = null;
let currentWebAudio: any = null;

export async function stopSpeech(): Promise<void> {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (currentWebAudio) {
      try {
        currentWebAudio.pause();
        currentWebAudio.currentTime = 0;
      } catch {}
      currentWebAudio = null;
    }
  }

  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {}
    currentSound = null;
  }
}

export async function playSpeech(
  text: string,
  langCode: string = "vi-VN",
  rate: number = 1.0,
  onStatusChange?: (isSpeaking: boolean) => void
): Promise<void> {
  await stopSpeech();
  if (!text || !text.trim()) {
    onStatusChange?.(false);
    return;
  }

  const shortLang = langCode.split("-")[0].toLowerCase();
  const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    text.slice(0, 480)
  )}&tl=${shortLang}&client=tw-ob`;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    onStatusChange?.(true);

    const playAudioFallback = () => {
      try {
        const audio = new window.Audio(ttsUrl);
        currentWebAudio = audio;
        audio.playbackRate = rate;
        audio.onended = () => {
          onStatusChange?.(false);
          currentWebAudio = null;
        };
        audio.onerror = () => {
          onStatusChange?.(false);
          currentWebAudio = null;
        };
        audio.play().catch(() => onStatusChange?.(false));
      } catch {
        onStatusChange?.(false);
      }
    };

    if ("speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === langCode.toLowerCase() ||
          v.lang.toLowerCase().startsWith(shortLang)
      );

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode;
      utter.rate = rate;
      if (matchedVoice) utter.voice = matchedVoice;

      utter.onend = () => onStatusChange?.(false);
      utter.onerror = () => playAudioFallback();
      window.speechSynthesis.speak(utter);
    } else {
      playAudioFallback();
    }
    return;
  }

  // Trên thiết bị Mobile (iOS & Android): Sử dụng expo-av phát âm thanh TTS
  try {
    onStatusChange?.(true);
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    const { sound } = await Audio.Sound.createAsync(
      { uri: ttsUrl },
      { shouldPlay: true, rate, shouldCorrectPitch: true },
      (status) => {
        if (!status.isLoaded) {
          if (status.error) {
            onStatusChange?.(false);
          }
          return;
        }
        if (status.didJustFinish) {
          onStatusChange?.(false);
          sound.unloadAsync().catch(() => {});
        }
      }
    );
    currentSound = sound;
  } catch (err) {
    console.warn("Mobile speech error:", err);
    onStatusChange?.(false);
  }
}
