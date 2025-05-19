import { View, TouchableOpacity } from "react-native";
import styles from "../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

const Ratings = ({ rating, setRating }) => {
  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return renderRatingPicker();
};

export default Ratings;
