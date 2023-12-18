import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  FlatList,
  Pressable,
} from "react-native";
import { Audio } from "expo-av";
import { Recording } from "expo-av/build/Audio";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { AudioNoteListItem } from "../components/AudioNoteListItem";

export type AudioNote = {
  uri: string;
  metering: number[];
};

export const AudioNotesScreen = () => {
  const [recording, setRecording] = useState<Recording | undefined>(undefined);
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);

  const [audioMetering, setAudioMetering] = useState<number[]>([]);

  const metering = useSharedValue(-100);

  async function startRecording() {
    try {
      setAudioMetering([]);

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        100
      );
      setRecording(recording);

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering) {
          metering.value = status.metering;
          setAudioMetering((curr) => [...curr, status.metering || -100]);
        }
      });
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();

    if (uri) {
      setAudioNotes((existingNotes) => [
        { uri, metering: audioMetering },
        ...existingNotes,
      ]);
    }
  }

  const animatedRedCircle = useAnimatedStyle(() => {
    return {
      width: withTiming(recording ? "60%" : "100%"),
      borderRadius: withTiming(recording ? 5 : 35),
    };
  });

  const animatedRecordWave = useAnimatedStyle(() => {
    const size = withTiming(
      interpolate(metering.value, [-160, -60, 0], [0, 0, -30], "clamp"),
      { duration: 100 }
    );

    return {
      top: size,
      left: size,
      right: size,
      bottom: size,
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        contentContainerStyle={styles.list}
        data={audioNotes}
        renderItem={({ item }) => <AudioNoteListItem note={item} />}
        keyExtractor={(item) => item.uri}
      />

      <View style={styles.footer}>
        <View>
          {recording && (
            <Animated.View style={[styles.recordWave, animatedRecordWave]} />
          )}
          <Pressable
            style={styles.recordButton}
            onPress={recording ? stopRecording : startRecording}
          >
            <Animated.View style={[styles.redCircle, animatedRedCircle]} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  footer: {
    backgroundColor: "white",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "gray",
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  redCircle: {
    backgroundColor: "orangered",
    aspectRatio: 1,
  },
  recordWave: {
    position: "absolute",
    borderRadius: 1000,
    backgroundColor: "#FF000055",
  },
});
