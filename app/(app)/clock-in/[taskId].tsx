import { useEffect, useRef, useState } from "react";
import { Alert, AppState, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { endSession, logProgress, startSession } from "@/api/clockins";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/ui/Confetti";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_SIZE = 260;
const RING_R = 115;
const RING_CIRC = 2 * Math.PI * RING_R;

const DURATIONS = [
  { label: "15s", s: 15 },
  { label: "30s", s: 30 },
  { label: "1m", s: 60 },
  { label: "5m", s: 300 },
  { label: "15m", s: 900 },
  { label: "30m", s: 1800 },
];

function fmt(total: number) {
  const m = Math.floor(Math.max(0, total) / 60);
  const s = Math.max(0, total) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Phase = "idle" | "grace" | "tracking" | "success" | "fail";

export default function ClockIn() {
  const { taskId, title, progress } = useLocalSearchParams<{
    taskId: string;
    title: string;
    progress: string;
  }>();
  const tid = Number(taskId);
  const startProgress = Math.round(Number(progress ?? 0));
  const router = useRouter();
  const qc = useQueryClient();

  const [phase, setPhase] = useState<Phase>("idle");
  const [planned, setPlanned] = useState(30);
  const [remaining, setRemaining] = useState(30);
  const [graceLeft, setGraceLeft] = useState(10);
  const [newProgress, setNewProgress] = useState(Math.min(100, startProgress + 10));
  const [saving, setSaving] = useState(false);

  const phaseRef = useRef<Phase>("idle");
  const plannedRef = useRef(30);
  const sessionId = useRef<number | null>(null);
  const graceEndAt = useRef(0);
  const endAt = useRef(0);
  const started = useRef(false);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const failKind = useRef<"left" | "gaveup">("left");

  // Juice: the timer ring drains as time passes; the fail screen shakes.
  const ringProgress = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRC * (1 - ringProgress.value),
  }));
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    if (phase === "fail") {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 90 }),
        withTiming(-8, { duration: 80 }),
        withTiming(6, { duration: 70 }),
        withTiming(0, { duration: 60 }),
      );
    }
  }, [phase, shakeX]);

  function setPhaseBoth(p: Phase) {
    phaseRef.current = p;
    setPhase(p);
  }
  function clearTicker() {
    if (ticker.current) {
      clearInterval(ticker.current);
      ticker.current = null;
    }
  }

  useEffect(() => () => clearTicker(), []);

  // Leaving the app while tracking = failure (the core mechanic).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next.match(/background|inactive/) && phaseRef.current === "tracking") {
        failKind.current = "left";
        void doFail();
      }
    });
    return () => sub.remove();
  }, []);

  function onTick() {
    const now = Date.now();
    if (!started.current) {
      const gl = Math.ceil((graceEndAt.current - now) / 1000);
      if (gl > 0) {
        setGraceLeft(gl);
      } else {
        started.current = true;
        endAt.current = now + plannedRef.current * 1000;
        setRemaining(plannedRef.current);
        setPhaseBoth("tracking");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      const r = Math.round((endAt.current - now) / 1000);
      ringProgress.value = withTiming(Math.max(r, 0) / plannedRef.current, {
        duration: 260,
        easing: Easing.linear,
      });
      if (r > 0) {
        setRemaining(r);
      } else {
        setRemaining(0);
        void doSuccess();
      }
    }
  }

  async function handleClockIn() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      plannedRef.current = planned;
      const session = await startSession(tid, planned);
      sessionId.current = session.id;
      started.current = false;
      setRemaining(planned);
      setGraceLeft(10);
      ringProgress.value = 1;
      graceEndAt.current = Date.now() + 10_000;
      setPhaseBoth("grace");
      clearTicker();
      ticker.current = setInterval(onTick, 250);
    } catch (e) {
      Alert.alert("Couldn't start", (e as Error).message);
    }
  }

  async function handleCancel() {
    clearTicker();
    started.current = false;
    ringProgress.value = 1;
    setPhaseBoth("idle");
    const id = sessionId.current;
    sessionId.current = null;
    if (id) await endSession(id, "cancelled");
  }

  async function doSuccess() {
    if (phaseRef.current === "success" || phaseRef.current === "fail") return;
    clearTicker();
    setPhaseBoth("success");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (sessionId.current) await endSession(sessionId.current, "succeeded");
  }

  async function doFail() {
    if (phaseRef.current === "success" || phaseRef.current === "fail") return;
    clearTicker();
    setPhaseBoth("fail");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    if (sessionId.current) await endSession(sessionId.current, "failed");
  }

  async function save() {
    setSaving(true);
    try {
      await logProgress(tid, startProgress, newProgress, plannedRef.current);
      qc.invalidateQueries({ queryKey: ["tasks"] });
      router.back();
    } catch (e) {
      Alert.alert("Couldn't save progress", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ---- screens ----

  if (phase === "success") {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-7xl">🎉</Text>
          <Text className="mt-3 text-3xl font-extrabold text-ink">You did it!</Text>
          <Text className="mt-2 text-center text-ink/60">
            You stayed locked in the whole time.
          </Text>

          <Text className="mt-10 text-sm font-semibold text-ink/60">How far are you now?</Text>
          <View className="mt-3 flex-row items-center gap-6">
            <Pressable
              onPress={() => setNewProgress((p) => Math.max(0, p - 5))}
              className="h-12 w-12 items-center justify-center rounded-full bg-white"
            >
              <Text className="text-2xl text-ink">−</Text>
            </Pressable>
            <Text className="w-24 text-center text-4xl font-extrabold text-blueberry">
              {newProgress}%
            </Text>
            <Pressable
              onPress={() => setNewProgress((p) => Math.min(100, p + 5))}
              className="h-12 w-12 items-center justify-center rounded-full bg-white"
            >
              <Text className="text-2xl text-ink">＋</Text>
            </Pressable>
          </View>

          <View className="mt-12 w-full gap-3">
            <Button label={saving ? "Saving…" : "Save progress"} onPress={save} disabled={saving} />
          </View>
        </View>
        <Confetti />
      </SafeAreaView>
    );
  }

  if (phase === "fail") {
    return (
      <SafeAreaView className="flex-1 bg-cream">
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View style={shakeStyle} className="items-center">
            <Text className="text-7xl">😬</Text>
            <Text className="mt-3 text-3xl font-extrabold text-ink">
              {failKind.current === "gaveup" ? "You gave up early" : "You left the app!"}
            </Text>
          </Animated.View>
          <Text className="mt-2 text-center text-ink/60">
            {failKind.current === "gaveup"
              ? "You clocked out before the timer finished."
              : "You switched away mid-session, so the clock-in failed."}
          </Text>
          <Text className="mt-2 text-center text-xs text-ink/40">
            (Once your council is set up, they&apos;ll be notified here.)
          </Text>

          <View className="mt-12 w-full">
            <Button label="Back to tasks" variant="secondary" onPress={() => router.back()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // idle / grace / tracking share the timer layout
  const isClocked = phase === "grace" || phase === "tracking";

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-4">
        {!isClocked && (
          <Pressable onPress={() => router.back()} className="mb-2" hitSlop={10}>
            <Text className="text-base text-blueberry">‹ Back</Text>
          </Pressable>
        )}

        <View className="flex-1 items-center justify-center">
          <Text className="mb-1 text-center text-2xl font-bold text-ink">{title}</Text>
          <Text className="mb-8 text-sm text-ink/50">
            {phase === "tracking"
              ? "Locked in — stay in the app"
              : phase === "grace"
                ? "Starting…"
                : "Pick a session length"}
          </Text>

          {/* timer ring */}
          <View
            style={{
              width: RING_SIZE,
              height: RING_SIZE,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Svg
              width={RING_SIZE}
              height={RING_SIZE}
              style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
            >
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                stroke="#ECECEC"
                strokeWidth={14}
                fill="none"
              />
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_R}
                stroke={phase === "grace" ? "#758ECD" : "#96DE90"}
                strokeWidth={14}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${RING_CIRC}`}
                animatedProps={ringProps}
              />
            </Svg>
            <Text
              className="text-6xl font-extrabold text-ink"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {fmt(phase === "tracking" ? remaining : planned)}
            </Text>
          </View>

          {/* duration chips while idle */}
          {phase === "idle" && (
            <View className="mt-8 flex-row flex-wrap justify-center gap-3">
              {DURATIONS.map((d) => (
                <Pressable
                  key={d.s}
                  onPress={() => {
                    setPlanned(d.s);
                    setRemaining(d.s);
                  }}
                  className={`rounded-full px-5 py-3 ${
                    planned === d.s ? "bg-apple" : "bg-white"
                  }`}
                >
                  <Text className={`font-semibold ${planned === d.s ? "text-white" : "text-ink"}`}>
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="pb-6">
          {phase === "idle" && <Button label="⏰  Clock In" onPress={handleClockIn} />}
          {phase === "grace" && (
            <Button label={`Cancel (${graceLeft})`} variant="secondary" onPress={handleCancel} />
          )}
          {phase === "tracking" && (
            <Button
              label="⏰  Clock Out (Give Up)"
              variant="danger"
              onPress={() => {
                failKind.current = "gaveup";
                void doFail();
              }}
            />
          )}
          {phase === "tracking" && (
            <Text className="mt-3 text-center text-xs text-ink/40">
              Leaving the app now counts as a fail.
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
