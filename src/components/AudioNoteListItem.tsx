import { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { AVPlaybackStatus, Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { FontAwesome5 } from "@expo/vector-icons";
import { Extrapolate, interpolate } from "react-native-reanimated";
import { AudioNote } from "../screens/AudioNotesScreen";

interface AudioNoteListItemProps {
  note: AudioNote;
}

export const AudioNoteListItem = ({ note }: AudioNoteListItemProps) => {
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [sound, setSound] = useState<Sound>();

  const { uri, metering } = note;

  async function onPlaybackStatusUpdate(newStatus: AVPlaybackStatus) {
    setStatus(newStatus);

    if (newStatus.isLoaded && newStatus.didJustFinish) {
      await sound?.pauseAsync();
      await sound?.setPositionAsync(0);
    }
  }

  async function loadSound() {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { progressUpdateIntervalMillis: 1000 / 60 },
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

  const formatMilliseconds = (ms?: number) => {
    if (!ms) return "0:00";

    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    const secondsRemainder = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutes}:${secondsRemainder}`;
  };

  useEffect(() => {
    loadSound();
  }, [note]);

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

  const progress = duration ? position / duration : 0;

  let lines = [];
  let numLines = 60;

  for (let i = 0; i < numLines; i++) {
    const meteringIndex = Math.floor((i * metering.length) / numLines);
    const nextMeteringIndex = Math.ceil(((i + 1) * metering.length) / numLines);

    const values = metering.slice(meteringIndex, nextMeteringIndex);
    const average = values.reduce((acc, curr) => acc + curr, 0) / values.length;

    lines.push(average);
  }

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
        <View style={styles.wave}>
          {lines.map((db, idx) => (
            <View
              key={`${db}[${idx}]`}
              style={[
                styles.waveLine,
                {
                  height: interpolate(db, [-60, 0], [5, 50], Extrapolate.CLAMP),
                  backgroundColor:
                    progress > idx / lines.length ? "royalblue" : "gainsboro",
                },
              ]}
            />
          ))}
        </View>

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
  duration: {
    position: "absolute",
    right: 0,
    fontSize: 12,
    bottom: -5,
    color: "gray",
  },
  position: {
    position: "absolute",
    left: 0,
    fontSize: 12,
    bottom: -5,
    color: "gray",
  },
  wave: {
    width: "100%",
    gap: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  waveLine: {
    flex: 1,
    backgroundColor: "gainsboro",
    borderRadius: 20,
  },
});
