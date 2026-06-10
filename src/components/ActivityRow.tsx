import { Text, View } from "react-native";

import type { ActivityItem } from "@/api/activity";
import { Avatar } from "@/components/ui/Avatar";
import { PulseDot } from "@/components/ui/PulseDot";
import { timeAgo } from "@/utils/timeAgo";

function nameOf(item: ActivityItem) {
  const p = item.user;
  if (!p) return "Someone";
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ");
  return full || (p.username ? `@${p.username}` : "Someone");
}

export function ActivityRow({ item }: { item: ActivityItem }) {
  const name = nameOf(item);
  return (
    <View className="flex-row items-center rounded-2xl bg-white p-3">
      <Avatar name={item.user?.username ?? item.user?.first_name} size={38} />
      <View className="ml-3 flex-1">
        {item.isLive ? (
          <Text className="text-ink">
            <Text className="font-bold">{name}</Text> is clocked in on “{item.taskTitle}”
          </Text>
        ) : item.status === "succeeded" ? (
          <Text className="text-ink">
            🎉 <Text className="font-bold">{name}</Text> crushed “{item.taskTitle}”
          </Text>
        ) : (
          <Text className="text-ink">
            😬 <Text className="font-bold">{name}</Text> bailed on “{item.taskTitle}”
          </Text>
        )}
        <Text className="mt-0.5 text-xs text-ink/40">
          {item.caseEmoji} {item.caseTitle}
          {item.isLive ? "  ·  LIVE" : `  ·  ${timeAgo(item.endedAt ?? item.startedAt)}`}
        </Text>
      </View>
      {item.isLive && <PulseDot />}
    </View>
  );
}
