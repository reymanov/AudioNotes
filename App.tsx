import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecorderView } from "./src/views/RecorderView";

export default function App() {
  return (
    <SafeAreaProvider>
      <RecorderView />
    </SafeAreaProvider>
  );
}
