import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RecordingListItem } from "../components/RecordingListItem";
import { RecordButton } from "../components/RecordButton";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

export const RecordingsScreen = () => {
  const {
    recording,
    recordings,
    animatedRecordWave,
    animatedRedCircle,
    stopRecording,
    startRecording,
  } = useAudioRecorder();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        contentContainerStyle={styles.list}
        data={recordings}
        renderItem={({ item }) => <RecordingListItem recording={item} />}
        keyExtractor={(item) => item.uri}
      />

      <View style={styles.footer}>
        <RecordButton
          recording={recording}
          animatedRecordWave={animatedRecordWave}
          animatedRedCircle={animatedRedCircle}
          onStopPress={stopRecording}
          onStartPress={startRecording}
        />
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
});
