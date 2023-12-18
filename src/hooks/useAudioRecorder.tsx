import { useState, useEffect } from "react";
import { Audio } from "expo-av";
import {
  useSharedValue,
  interpolate,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Recording } from "../types/Recording";

export const useAudioRecorder = () => {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(
    undefined
  );
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [audioMetering, setAudioMetering] = useState<number[]>([]);

  const metering = useSharedValue(-100);

  const startRecording = async () => {
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
  };

  const stopRecording = async () => {
    if (!recording) return;

    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();

    if (uri) {
      setRecordings((existingRecordings) => [
        { uri, metering: audioMetering, timestamp: Date.now() },
        ...existingRecordings,
      ]);
    }
  };

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

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  return {
    recording,
    recordings,
    startRecording,
    stopRecording,
    animatedRedCircle,
    animatedRecordWave,
  };
};
