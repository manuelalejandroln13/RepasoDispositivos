import { Image, StyleSheet, Text, View } from "react-native";

export default function ProductCard({ product }) {
  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.contentLeft}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </View>
        <View style={styles.contentRigth}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>$ {product.price}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    marginBottom: 20,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  contentLeft: {
    width: "40%",
  },
  image: {
    width: 120,
    height: 150,
    borderRadius: 10,
    margin: "3%",
  },
  contentRigth: {
    justifyContent: "center",
    alignItems: "center",
    width: "60%",
    height: 150,
  },
  title: {
    textAlign: "center",
    height: "75%",
    fontSize: 18,
    width: "100%",
  },
  price: {
    textAlign: "center",
    height: "25%",
    fontSize: 24,
    fontWeight: "bold",
  },
});
