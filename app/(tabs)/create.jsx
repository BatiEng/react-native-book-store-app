import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../assets/styles/create.styles";
import COLORS from "../../constants/colors";
import Ratings from "../../components/Ratings";
import { useAuthStore } from "../../store/authStore";

const Create = () => {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const { backendURL, token } = useAuthStore();

  const router = useRouter();

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission denied, we need camera roll permissions to upload an image"
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.001, // lower quality
          base64: true,
        });
        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }

        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            { encoding: FileSystem.EncodingType.Base64 }
          );
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "There was an error selecting your immage");
    }
  };
  const handleSubmit = async () => {
    if (!title || !caption || !imageBase64 || !rating) {
      Alert.alert("Error", "Please provide all the blank fields");
      return;
    }
    try {
      setLoading(true);
      const uriPart = image.split(".");
      const fileType = uriPart[uriPart.length - 1];
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : `image/jpeg`;
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;
      const response = await axios.post(
        backendURL + "book/create",
        { title, caption, rating },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        Alert.alert("Success", "Your book recomendation has been posted");
        setTitle("");
        setCaption("");
        setRating(3);
        setImage(null);
        setImageBase64(null);
        router.push("/");
      } else {
        console.log(response.data.message);
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.log(error);
      console.log(error.response.data.message);
      Alert.alert("Error", error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          style={styles.scrollViewStyle}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Add book recommendation</Text>
              <Text style={styles.subtitle}>
                Share your favorites read with others
              </Text>
            </View>
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Book Title</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="book-outline"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter a book title"
                    placeholderTextColor={COLORS.placeholderText}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Your Rating</Text>
                <Ratings rating={rating} setRating={setRating} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Book Image</Text>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={pickImage}
                >
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons
                        name="image-outline"
                        size={40}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.placeholderText}>
                        Tap to a select image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Caption</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Write your review or thoughts about this book..."
                  placeholderTextColor={styles.placeholderText}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                />
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color={COLORS.white}
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Share</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Create;
