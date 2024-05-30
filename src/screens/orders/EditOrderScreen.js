import React, { useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, Image, Pressable, ScrollView, ImageBackground } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import { updateOrder, getOrderDetail } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import DeleteModalEditOrder from '../../components/DeleteModalEditOrder'

export default function EditOrderScreen ({ navigation, route }) {
  const [order, setOrder] = useState({})
  const [restaurant, setRestaurant] = useState({})
  const [orderToBeDimiss, setOrderToBeDimiss] = useState(null)

  const [precio, setPrecio] = useState([])
  const [quantities, setQuantity] = useState([])
  const [orderProducts, setOrderProducts] = useState([])
  const [newAddress, setNewAddress] = useState(null)

  useEffect(() => {
    fetchOrderDetail()
  }, [route])

  async function fetchOrderDetail () {
    try {
      const fetchedOrder = await getOrderDetail(route.params.id)
      setOrder(fetchedOrder)
      setNewAddress(fetchedOrder.address)
      const fetchedRestaurant = await getDetail(fetchedOrder.restaurantId)
      const prices = fetchedRestaurant.products.map(product => product.price)
      const cantidad2 = fetchedRestaurant.products.map(product => {
        const orderProduct = fetchedOrder.products.find(op => op.id === product.id)
        return orderProduct ? orderProduct.OrderProducts.quantity : 0
      })
      const newPrices = []
      setQuantity(cantidad2)
      for (let i = 0; i < cantidad2.length; i++) {
        if (cantidad2[i] > 0) {
          newPrices.push(cantidad2[i] * prices[i])
        } else {
          newPrices.push(0)
        }
      }
      setPrecio(newPrices)
      setRestaurant(fetchedRestaurant)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving your orders. ${error}`,
        type: 'error',
        style: flashStyle,
        textStyle: flashTextStyle
      })
    }
  }

  const renderProduct = ({ item, index }) => {
    return (
    <View style={{ flex: 5, padding: 10 }}>
      {index === 0 && (
        <View style={{ width: 300, marginLeft: 130 }}>
          <TextSemiBold> Enter your new Address </TextSemiBold>
          <input
            type='text'
            name='newAddress'
            placeholder='Enter your new address'
            defaultValue={order.address}
            onChange={(text) => setNewAddress(text.target.value)}
          />
        </View>
      )}
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        <View>
          <TextRegular>
            Cantidad: {quantities[index]}
            <TextRegular textStyle={{ paddingLeft: 50 }}>
              Precio total: <TextSemiBold>{precio[index]} €</TextSemiBold>
            </TextRegular>
          </TextRegular>
          <View style={{ alignItems: 'flex-start' }}>
            <View style={{ width: 50 }}>
              <input
                type='number'
                style={styles.input}
                name='quantity'
                placeholder='0'
                defaultValue={quantities[index]}
                min='0'
                onKeyPress={(event) => {
                  const keyCode = event.keyCode || event.which
                  const keyValue = String.fromCharCode(keyCode)
                  if (/\D/.test(keyValue)) {
                    event.preventDefault()
                  }
                }}
                onChange={(quantity) => updatePriceQuantity({ quantity: quantity.target.value, index, item })}
              />
            </View>
          </View>
        </View>
      </ImageCard>
    </View>
    )
  }

  const renderHeader = (item) => {
    return (
      <View>
      <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
      <View style={styles.restaurantHeaderContainer}>
        <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
        <TextSemiBold textStyle={styles.textTitle}>Order {order.id}</TextSemiBold>
        <TextRegular textStyle={styles.headerText}>Created at: {order.createdAt}</TextRegular>
        {order && <TextRegular textStyle={styles.headerText}>Started at: {order.startedAt}</TextRegular>}
        <TextRegular textStyle={styles.headerText}>Total Price: {order.price} €</TextRegular>
        <TextRegular textStyle={styles.headerText}>Address: {order.address}</TextRegular>
        <TextRegular textStyle={styles.headerText}>Shipping costs: {order.shippingCosts} €</TextRegular>
        <TextRegular textStyle={styles.headerText}>Status: {order.status}</TextRegular>
      </View>
      </ImageBackground>
      <Pressable
          onPress={() => { setOrderToBeDimiss(item) }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? 'red'
                : 'black'
            },
            styles.button
          ]}>
          <TextRegular textStyle={styles.text}>
            Confirm update
          </TextRegular>
        </Pressable>

      </View>

    )
  }

  const renderFooter = () => {
    return (
    <View style = {styles.FRHeader}>

    </View>
    )
  }

  const editOrder = async () => {
    const quantitiesFiltered = quantities.filter((quantity, index) => quantities[index] > 0)
    const updatedOrder = {
      address: newAddress,
      products: restaurant.products
        .filter((product, index) => quantities[index] > 0)
        .map((product, index) => ({
          productId: product.id,
          quantity: quantitiesFiltered[index]
        }))
    }

    console.log(updateOrder)
    try {
      await updateOrder(order.id, updatedOrder)
      showMessage({
        message: 'Orden actualizada correctamente',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      // fetchRestaurantDetail()
      setOrderToBeDimiss(null)
      setTimeout(() => {
        window.location.reload()
      }, 500)
      navigation.navigate('OrdersScreen')
    } catch (error) {
      console.log(error)
      if (newAddress === '') {
        showMessage({
          message: 'No se pudo editar la orden porque la direccón es vacía.',
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      } else {
        showMessage({
          message: 'No se pudo editar la orden porque no hay productos.',
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
  }

  function updateOrderProducts ({ q, index, prid }) {
    const auxPr = [...orderProducts]
    if (q === 0) {
      auxPr.remove(index)
    } else {
      auxPr[index] = { productId: prid, quantity: q }
    }
    setOrderProducts(auxPr)
  }

  function updatePriceQuantity ({ quantity, index, item }) {
  // Updating the quantity
    const auxQuantity = [...quantities]
    auxQuantity[index] = parseInt(quantity)
    setQuantity(auxQuantity)
    // Updating the price
    const precioAux = [...precio]
    precioAux[index] = item.price * quantity
    setPrecio(precioAux)
    updateOrderProducts(quantity, index, item.id)
  }

  return (
    <ScrollView>
    <FlatList
        ListHeaderComponent={renderHeader}
        style={styles.container}
        data={restaurant.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={renderFooter}
      />
      <DeleteModalEditOrder
          isVisible={orderToBeDimiss !== null}
          onCancel={() => setOrderToBeDimiss(null)}
          onConfirm={() => editOrder()}>
        <TextRegular>Are you sure that you want to edit this order? </TextRegular>
        </DeleteModalEditOrder>
    </ScrollView>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: 'black'
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    marginBottom: 5

  },
  addresInput: {
    alignItems: 'center',
    height: 15,
    width: 15

  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  },
  headerText: {
    color: 'white',
    textAlign: 'center'
  }
})
