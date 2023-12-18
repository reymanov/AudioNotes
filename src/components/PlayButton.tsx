import { TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface Props {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export const PlayButton = ({ isPlaying, onPlay, onPause }: Props) => {
  return (
    <TouchableOpacity onPress={isPlaying ? onPause : onPlay}>
      <FontAwesome5
        name={isPlaying ? "pause" : "play"}
        size={20}
        color="gray"
      />
    </TouchableOpacity>
  );
};
