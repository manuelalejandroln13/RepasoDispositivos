import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import axios from 'axios';
import Product from "./ProductCard";
import Detail from "./Detail";

const List = () => {
  const [products, setProducts] = useState([]);
  const [showProduct, setShowProduct] = useState(false);
  const [product, setProduct] = useState();

  useEffect(() => {
    axiosData();
  }, []);

  const axiosData = async () => {
    try {
      const response = await axios.get('https://fakestoreapi.com/products');
      const jsonData = response.data;
      setProducts(jsonData);
    } catch (error) {
      console.error("error", error);
    }
  };

  const Item = ({ product, i }) => {
    return (
      <TouchableOpacity
        style={styles.perItem}
        key={i}
        onPress={() => {
          getProduct(product);
        }}
      >
        <Product product={product} />
      </TouchableOpacity>
    );
  };

  const closeProduct = () => {
    setShowProduct(!showProduct);
  };
  const getProduct = (product) => {
    setShowProduct(true);
    setProduct(product);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Product list</Text>
      {products && (
        <View style={styles.container}>
          <View style={styles.taskWrapper}>
            <View style={styles.items}>
              <FlatList
                data={products}
                renderItem={({ item, i }) => <Item product={item} i={i} />}
              ></FlatList>
            </View>
          </View>

          <Modal
            transparent={true}
            animationType={"slide"}
            visible={showProduct}
            onRequestClose={() => {
              Alert.alert("Modal has been close");
              setShowProduct(!showProduct);
            }}
          >
            <View style={styles.centerView}>
              <Text style={styles.modalText}>
                <Detail product={product} closeProduct={closeProduct} />
              </Text>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    display: "flex",
    height: "93%",
  },
  taskWrapper: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    paddingTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  items: {},
  perItem: {},
  centerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(49, 49, 49, 0.5)",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
export default List;
