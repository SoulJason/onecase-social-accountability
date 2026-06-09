import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Wraps form content so the keyboard never covers inputs.
 * - lifts content above the keyboard (KeyboardAvoidingView)
 * - lets you tap buttons while the keyboard is open (keyboardShouldPersistTaps)
 * - dismisses the keyboard when you drag/scroll
 */
export function FormScreen({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <SafeAreaView className="flex-1 bg-cream">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: center ? "center" : "flex-start",
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
