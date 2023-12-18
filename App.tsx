import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecorderView } from "./views/RecorderView";

export default function App() {
  return (
    <SafeAreaProvider>
      <RecorderView />
    </SafeAreaProvider>
  );
}
