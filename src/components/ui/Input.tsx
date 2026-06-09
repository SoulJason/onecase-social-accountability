import { TextInput, type TextInputProps } from "react-native";

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#9a9a9a"
      className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-4 text-base text-ink"
      {...props}
    />
  );
}
