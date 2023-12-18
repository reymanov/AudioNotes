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
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { RecordingListItem } from "../components/RecordingListItem";

export const RecordingsView = () => {
  const [recording, setRecording] = useState<Recording | undefined>(undefined);
  const [notes, setNotes] = useState<string[]>([]);

  const metering = useSharedValue(-100);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        1000 / 60
      );
      setRecording(recording);
      recording.setOnRecordingStatusUpdate((status) => {
        metering.value = status.metering || -100;
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
      setNotes((existingNotes) => [uri, ...existingNotes]);
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
        data={notes}
        renderItem={({ item }) => <RecordingListItem uri={item} />}
        keyExtractor={(item) => item}
      />

      <View style={styles.footer}>
        <View>
          <Animated.View style={[styles.recordWave, animatedRecordWave]} />
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
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 1000,
    backgroundColor: "#FF000055",
  },
});
