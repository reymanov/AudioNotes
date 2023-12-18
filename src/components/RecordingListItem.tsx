import { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { FontAwesome5 } from "@expo/vector-icons";

interface RecordingListItemProps {
  uri: string;
}

export const RecordingListItem = ({ uri }: RecordingListItemProps) => {
  const [sound, setSound] = useState<Sound>();
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);

  async function onPlaybackStatusUpdate(newStatus: AVPlaybackStatus) {
    setStatus(newStatus);

    if (newStatus.isLoaded && newStatus.didJustFinish) {
      await sound?.setPositionAsync(0);
      await sound?.pauseAsync();
    }
  }

  async function loadSound() {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      undefined,
      onPlaybackStatusUpdate
    );
    setSound(sound);
  }

  async function playSound() {
    if (!sound) return;
    await sound.replayAsync();
  }

  async function pauseSound() {
    if (!sound) return;
    await sound.pauseAsync();
  }

  const formatMilliseconds = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    const secondsRemainder = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${secondsRemainder}`;
  };

  useEffect(() => {
    loadSound();
  }, [uri]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const position = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis : 1;

  const progress = (position / duration) * 100;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={isPlaying ? pauseSound : playSound}>
        <FontAwesome5
          name={isPlaying ? "pause" : "play"}
          size={20}
          color="gray"
        />
      </TouchableOpacity>

      <View style={styles.playbackContainer}>
        <View style={styles.playbackBackground} />
        <View style={[styles.playbackIndicator, { left: `${progress}%` }]} />

        <Text style={styles.position}>{formatMilliseconds(position)}</Text>
        <Text style={styles.duration}>{formatMilliseconds(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  playbackContainer: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 16,
  },
  playbackBackground: {
    backgroundColor: "gainsboro",
    height: 4,
    width: "100%",
    borderRadius: 4,
  },
  playbackIndicator: {
    position: "absolute",
    backgroundColor: "royalblue",
    width: 14,
    aspectRatio: 1,
    borderRadius: 14,
  },
  duration: {
    position: "absolute",
    right: 0,
    bottom: 0,
    color: "gray",
  },
  position: {
    position: "absolute",
    left: 0,
    bottom: 0,
    color: "gray",
  },
});
