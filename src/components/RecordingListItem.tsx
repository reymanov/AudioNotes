import { Text, View, StyleSheet } from "react-native";
import { formatMilliseconds } from "../utils/format";
import { Recording } from "../types/Recording";
import { PlayButton } from "./PlayButton";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { AudioWave } from "./AudioWave";

interface Props {
  recording: Recording;
}

export const RecordingListItem = ({ recording }: Props) => {
  const { status, isPlaying, playSound, pauseSound } =
    useAudioPlayback(recording);

  const { metering } = recording;

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
      <View style={styles.card}>
        <PlayButton
          isPlaying={isPlaying}
          onPlay={playSound}
          onPause={pauseSound}
        />

        <View style={styles.playbackContainer}>
          <AudioWave lines={lines} progress={progress} />

          <Text style={styles.duration}>
            {formatMilliseconds(position)} / {formatMilliseconds(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  card: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  playbackContainer: {
    flex: 1,
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 16,
  },
  duration: {
    position: "absolute",
    right: 0,
    fontSize: 12,
    bottom: -4,
    color: "gray",
  },
});
