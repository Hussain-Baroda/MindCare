import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Play, Pause, Clock, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { logMeditation } from "@/lib/meditation";
import { useNavigate } from "react-router-dom";

const sessions = [
  { id: 1, soundId: "morning", title: "Morning Mindfulness", soundLabel: "Morning chimes", duration: "10 min", description: "Start your day with calm and focus", category: "Morning" },
  { id: 2, soundId: "stress", title: "Stress Relief", soundLabel: "Slow relief music", duration: "15 min", description: "Release tension and find peace", category: "Stress" },
  { id: 3, soundId: "sleep", title: "Sleep Preparation", soundLabel: "Sleepy music", duration: "20 min", description: "Wind down for restful sleep", category: "Sleep" },
  { id: 4, soundId: "anxiety", title: "Anxiety Management", soundLabel: "Anxiety easing tone", duration: "12 min", description: "Calm your mind and ease worries", category: "Anxiety" },
  { id: 5, soundId: "energy", title: "Energy Boost", soundLabel: "Gentle energy music", duration: "8 min", description: "Refresh and energize your day", category: "Energy" },
  { id: 6, soundId: "relaxation", title: "Deep Relaxation", soundLabel: "Deep relaxation drone", duration: "25 min", description: "Complete body and mind relaxation", category: "Relaxation" },
];

const sounds = [
  { id: "rain", label: "Rain", description: "Heavy calming rain" },
  { id: "ocean", label: "Ocean", description: "Tides and water crashes" },
  { id: "forest", label: "Forest", description: "Trees, birds, and air" },
  { id: "wind", label: "Wind", description: "Hushing gusts" },
  { id: "bells", label: "Soft Bells", description: "Gentle bell tones" },
  { id: "drone", label: "Calm Drone", description: "Steady calm sound" },
];

type SoundId =
  | "rain"
  | "ocean"
  | "forest"
  | "wind"
  | "bells"
  | "drone"
  | "morning"
  | "stress"
  | "sleep"
  | "anxiety"
  | "energy"
  | "relaxation";

type AudioState = {
  context: AudioContext;
  nodes: AudioNode[];
  intervals: number[];
  timeoutIds: number[];
};

const MASTER_VOLUME = 2.8;

function parseMinutes(duration: string): number {
  const n = Number(String(duration).replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function toLoggedMinutes(seconds: number) {
  return Math.max(0.1, Math.round((seconds / 60) * 10) / 10);
}

const Meditation = () => {
  const [playing, setPlaying] = useState<number | null>(null);
  const [currentSound, setCurrentSound] = useState<{ id: SoundId; label: string; source: "ambient" | "session" } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [logging, setLogging] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const audioRef = useRef<AudioState | null>(null);
  const { toast } = useToast();
  const nav = useNavigate();

  useEffect(() => {
    if (!currentSound || !startedAtRef.current) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current!) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentSound]);

  useEffect(() => {
    return () => stopSound();
  }, []);

  function stopSound() {
    if (!audioRef.current) return;
    audioRef.current.intervals.forEach((id) => window.clearInterval(id));
    audioRef.current.timeoutIds.forEach((id) => window.clearTimeout(id));
    audioRef.current.nodes.forEach((node) => {
      if ("stop" in node) {
        try {
          (node as AudioBufferSourceNode | OscillatorNode).stop();
        } catch {
          // Already stopped.
        }
      }
    });
    audioRef.current.context.close();
    audioRef.current = null;
  }

  function makeNoise(context: AudioContext) {
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  function addTone(
    state: AudioState,
    frequency: number,
    gainValue: number,
    type: OscillatorType = "sine",
    destination?: AudioNode
  ) {
    const oscillator = state.context.createOscillator();
    const gain = state.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue * MASTER_VOLUME;
    oscillator.connect(gain);
    gain.connect(destination ?? state.context.destination);
    oscillator.start();
    state.nodes.push(oscillator, gain);
    return { oscillator, gain };
  }

  function addNoiseLayer(
    state: AudioState,
    gainValue: number,
    filterType: BiquadFilterType,
    frequency: number,
    q = 0.7
  ) {
    const source = makeNoise(state.context);
    const filter = state.context.createBiquadFilter();
    const gain = state.context.createGain();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    gain.gain.value = gainValue * MASTER_VOLUME;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(state.context.destination);
    source.start();
    state.nodes.push(source, filter, gain);
    return { source, filter, gain };
  }

  function playBlip(
    state: AudioState,
    frequency: number,
    duration = 0.45,
    gainValue = 0.035,
    type: OscillatorType = "sine"
  ) {
    const now = state.context.currentTime;
    const oscillator = state.context.createOscillator();
    const gain = state.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue * MASTER_VOLUME, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(state.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
    state.nodes.push(oscillator, gain);
  }

  function startSound(soundId: SoundId, label: string, source: "ambient" | "session") {
    stopSound();
    const context = new AudioContext();
    const state: AudioState = { context, nodes: [], intervals: [], timeoutIds: [] };
    audioRef.current = state;

    if (soundId === "rain") {
      addNoiseLayer(state, 0.24, "lowpass", 1100, 0.6);
      addNoiseLayer(state, 0.12, "highpass", 2600, 0.3);
      addTone(state, 58, 0.04, "sine");
    } else if (soundId === "ocean") {
      const wave = addNoiseLayer(state, 0.22, "lowpass", 380, 1.4);
      const crash = addNoiseLayer(state, 0.13, "bandpass", 850, 1.1);
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.frequency.value = 0.22;
      lfoGain.gain.value = 0.18;
      lfo.connect(lfoGain);
      lfoGain.connect(wave.gain.gain);
      lfoGain.connect(crash.gain.gain);
      lfo.start();
      state.nodes.push(lfo, lfoGain);
      addTone(state, 42, 0.045, "sine");
    } else if (soundId === "forest") {
      addNoiseLayer(state, 0.035, "bandpass", 520, 1.7);
      addNoiseLayer(state, 0.028, "lowpass", 260, 0.5);
      addTone(state, 210, 0.018, "triangle");
      const chirp = () => {
        playBlip(state, 1150 + Math.random() * 1200, 0.12, 0.05, "sine");
        state.timeoutIds.push(window.setTimeout(() => playBlip(state, 1500 + Math.random() * 800, 0.08, 0.035), 90));
      };
      chirp();
      state.intervals.push(window.setInterval(chirp, 850));
      state.intervals.push(window.setInterval(() => playBlip(state, 650 + Math.random() * 220, 0.18, 0.028, "triangle"), 1700));
    } else if (soundId === "wind") {
      const wind = addNoiseLayer(state, 0.2, "bandpass", 300, 0.35);
      addNoiseLayer(state, 0.06, "highpass", 1800, 0.2);
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.frequency.value = 0.33;
      lfoGain.gain.value = 520;
      lfo.connect(lfoGain);
      lfoGain.connect(wind.filter.frequency);
      lfo.start();
      state.nodes.push(lfo, lfoGain);
    } else if (soundId === "bells") {
      const ring = () => {
        playBlip(state, 528, 1.4, 0.07);
        state.timeoutIds.push(window.setTimeout(() => playBlip(state, 792, 1.6, 0.05), 180));
      };
      ring();
      state.intervals.push(window.setInterval(ring, 3600));
    } else if (soundId === "drone") {
      addTone(state, 82, 0.095, "sine");
      addTone(state, 123, 0.055, "triangle");
      addTone(state, 164, 0.04, "sine");
    } else if (soundId === "morning") {
      addTone(state, 196, 0.055, "triangle");
      addTone(state, 261.63, 0.04, "sine");
      playBlip(state, 659, 0.9, 0.055);
      state.intervals.push(window.setInterval(() => playBlip(state, 659, 0.9, 0.06), 2200));
    } else if (soundId === "stress") {
      addTone(state, 102, 0.085, "sine");
      addTone(state, 153, 0.052, "triangle");
      addNoiseLayer(state, 0.05, "lowpass", 620, 0.8);
    } else if (soundId === "sleep") {
      addTone(state, 64, 0.1, "sine");
      addTone(state, 96, 0.055, "sine");
      addNoiseLayer(state, 0.045, "lowpass", 330, 0.6);
    } else if (soundId === "anxiety") {
      addTone(state, 136, 0.075, "sine");
      addTone(state, 272, 0.038, "triangle");
      addNoiseLayer(state, 0.04, "lowpass", 560, 0.8);
    } else if (soundId === "energy") {
      addTone(state, 220, 0.06, "triangle");
      addTone(state, 330, 0.045, "sine");
      playBlip(state, 440, 0.28, 0.055);
      state.intervals.push(window.setInterval(() => playBlip(state, 440, 0.28, 0.055), 1500));
    } else if (soundId === "relaxation") {
      addTone(state, 55, 0.105, "sine");
      addTone(state, 82, 0.065, "triangle");
      addTone(state, 110, 0.044, "sine");
    }

    setCurrentSound({ id: soundId, label, source });
  }

  const finishSession = async () => {
    if (!playing || !startedAtRef.current) return;
    const s = sessions.find((x) => x.id === playing);
    if (!s) return;

    const seconds = Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000));
    const minutes = toLoggedMinutes(seconds);

    setLogging(true);
    try {
      await logMeditation(`${s.title} - ${currentSound?.label ?? s.soundLabel}`, minutes);
      toast({
        title: "Session logged",
        description: `${minutes} min saved to your dashboard.`,
      });
      nav("/dashboard?refresh=1", { replace: true });
    } catch (err: any) {
      toast({
        title: "Could not log session",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLogging(false);
      setPlaying(null);
      setElapsedSeconds(0);
      startedAtRef.current = null;
      stopSound();
      setCurrentSound(null);
    }
  };

  const handleToggle = async (sessionId: number) => {
    if (playing === sessionId) {
      await finishSession();
      return;
    }

    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    setPlaying(sessionId);
    const session = sessions.find((item) => item.id === sessionId);
    if (session) startSound(session.soundId as SoundId, session.soundLabel, "session");
  };

  const handleAmbientSound = (soundId: SoundId, label: string) => {
    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    setPlaying(null);
    startSound(soundId, label, "ambient");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold mb-4">
              Guided <span className="gradient-text">Meditation</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose an ambient sound or a guided session. Your dashboard logs the actual time you meditate.
            </p>
          </div>

          <div className="glass-card p-5 rounded-xl mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Meditation Sounds</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
              {sounds.map((sound) => (
                <button
                  key={sound.id}
                  type="button"
                  onClick={() => handleAmbientSound(sound.id as SoundId, sound.label)}
                  className={`rounded-lg border px-3 py-3 text-left text-sm smooth-transition ${
                    currentSound?.id === sound.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="block font-medium">{sound.label}</span>
                  <span className="block text-xs text-muted-foreground mt-1">{sound.description}</span>
                </button>
              ))}
            </div>
          </div>

          {currentSound && (
            <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              <span className="font-semibold">{currentSound.label}</span> is playing for{" "}
              <span className="font-semibold">{formatElapsed(elapsedSeconds)}</span>
              {currentSound.source === "ambient" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="ml-4"
                  onClick={() => {
                    stopSound();
                    setCurrentSound(null);
                    setElapsedSeconds(0);
                    startedAtRef.current = null;
                  }}
                >
                  Stop
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className="glass-card p-6 rounded-xl hover-lift smooth-transition animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {session.category}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{session.duration}</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
                <p className="text-muted-foreground mb-6">{session.description}</p>
                <div className="mb-4 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  Sound: <span className="font-medium text-foreground">{session.soundLabel}</span>
                </div>

                <Button
                  onClick={() => handleToggle(session.id)}
                  disabled={logging}
                  className={`w-full ${
                    playing === session.id
                      ? "bg-accent hover:bg-accent/90"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {playing === session.id ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      {logging ? "Logging..." : "Finish & Log"}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Session
                    </>
                  )}
                </Button>
                {playing === session.id && (
                  <div className="mt-3 text-center text-xs text-muted-foreground">
                    Suggested length: {parseMinutes(session.duration)} min
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Meditation;
