import {
  View,
  Text,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../assets/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../lib/utils";
import Loader from "../../components/Loader";

const Home = () => {
  const { token, backendURL, user } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async (pageNum = 1, refreshing = false) => {
    try {
      if (refreshing) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      const response = await axios.post(
        backendURL + `book?page=${pageNum}&limit=2`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        console.log(response.data.message);
        setBooks((prev) => [...prev, ...response.data.books]);

        setHasMore(pageNum < response.data.totalPages);
        setPage(pageNum);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.response.data.message);
    } finally {
      if (refreshing) setRefreshing(false);
      else setLoading(false);
    }
  };
  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user.profileImage }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>
      <View style={styles.bookImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.bookImage}
          contentFit="cover"
        />
      </View>
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          Shared on {formatPublishDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) return <Loader size="small" />;
  return (
    <View style={styles.container}>
      {books && (
        <FlatList
          data={books}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBooks(1, true)}
              colors={COLORS.primary}
              tintColor={COLORS.primary}
            />
          }
          onEndReachedThreshold={0.2}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            hasMore && books.length > 0 ? (
              <ActivityIndicator
                style={styles.footerLoader}
                size="small"
                color={COLORS.primary}
              />
            ) : null
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bookworm 🐛</Text>
              <Text style={styles.headerSubtitle}>
                Discover great reads from the community
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="book-outline"
                size={60}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>No recommendations yet</Text>
              <Text style={styles.emptySubtext}>
                Let&apos;s be the first one who share recommendation
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Home;
