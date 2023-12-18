import { Audio } from "expo-av";
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated from "react-native-reanimated";

interface Props {
  recording: Audio.Recording | undefined;
  animatedRecordWave: Object;
  animatedRedCircle: Object;
  onStopPress: () => void;
  onStartPress: () => void;
}
export const RecordButton = ({
  recording,
  animatedRecordWave,
  animatedRedCircle,
  onStopPress,
  onStartPress,
}: Props) => {
  return (
    <View>
      {recording && (
        <Animated.View style={[styles.recordWave, animatedRecordWave]} />
      )}
      <Pressable
        style={styles.recordButton}
        onPress={recording ? onStopPress : onStartPress}
      >
        <Animated.View style={[styles.redCircle, animatedRedCircle]} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
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
