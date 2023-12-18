import { SafeAreaProvider } from "react-native-safe-area-context";
import { AudioNotesScreen } from "./src/screens/AudioNotesScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioNotesScreen />
    </SafeAreaProvider>
  );
}
