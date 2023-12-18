import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecordingsView } from "./src/views/RecordingsView";

export default function App() {
  return (
    <SafeAreaProvider>
      <RecordingsView />
    </SafeAreaProvider>
  );
}
