import React from "react";
import { View, StyleSheet, Image, Text, Button } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const instagram = <Icon name={"instagram"} size={30} color={"black"} />;
const portafolio_url = <Icon name={"globe"} size={30} color={"black"} />;

const Detail = ({ product, closeProduct }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.title}</Text>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.price}>$ {product.price}</Text>
      <View style={styles.button}>
        <Button title={"Close"} onPress={closeProduct} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    width: 360,
    height: 700,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    width: "80%",
  },
  image: {
    width: 180,
    height: 220,
    borderRadius: 10,
    margin: "3%",
  },
  description: {
    textAlign: "center",
    fontSize: 12,
    width: "80%",
  },
  price: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 20,
  },
  button: {
    paddingLeft: 10,
  },
});

export default Detail;
