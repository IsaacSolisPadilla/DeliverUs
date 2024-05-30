/* eslint-disable react/prop-types */
import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, ScrollView } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { getDetail } from '../../api/RestaurantEndpoints'
import { create } from '../../api/OrderEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import { flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import DeleteModalOrder from '../../components/DeleteModalOrder'
import InputItem from '../../components/InputItem'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const [restaurant, setRestaurant] = useState({})
  const [precio, setPrecio] = useState([])
  const [quantities, setQuantity] = useState([])
  const [orderProducts, setOrderProducts] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)
  const [orderToBeDimiss, setOrderToBeDimiss] = useState(null)

  if (loggedInUser) {
    const newOrder = { address: loggedInUser.address, restaurantId: null, products: orderProducts }

    useEffect(() => {
      fetchRestaurantDetail()
    }, [loggedInUser, route])

    async function fetchRestaurantDetail () {
      try {
        const fetchedRestaurant = await getDetail(route.params.id)

        const cantidad = fetchedRestaurant.products.map(x => 0)
        setQuantity(cantidad)
        setPrecio(cantidad)
        setRestaurant(fetchedRestaurant)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving orders. ${error} `,
          type: 'error',
          style: flashStyle,
          titleStyle: flashTextStyle
        })
      }
    }

    const renderHeader = (item) => {
      if (loggedInUser) {
        return (
        <View>
          <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>

            <View style={styles.restaurantHeaderContainer}>
              <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
              <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
              <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
              <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>

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
            Create order
          </TextRegular>
        </Pressable>
        </View>
        )
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

    const renderProduct = ({ item, index }) => {
      return (
      <View style={{ flex: 5, padding: 10 }}>
      <ImageCard
        imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
        title={item.name}
        >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
        {/* We'll do here an input to show a little card in which the client can put the quantity he wants. */}
        <View>
          <TextRegular>Cantidad: {quantities[index]}
              <TextRegular textStyle={{ paddingLeft: 50 }}>Precio total: <TextSemiBold>{precio[index]} €</TextSemiBold></TextRegular>
              </TextRegular>
          <View style={{ alignItems: 'flex-start' }}>
            <View style={{ width: 50 }}>
            {/* FR3: Add, edit and remove products to a new order.
                A customer can add several products, and several units of a product to a new order.
                Before confirming, customer can edit and remove products.
                Once the order is confirmed, it cannot be edited or removed. */}
              <input type = 'number'
                style={styles.input}
                name='quantity'
                placeholder='0'
                min = '0'
                onKeyPress={(event) => {
                  const keyCode = event.keyCode || event.which
                  const keyValue = String.fromCharCode(keyCode)
                  if (/\D/.test(keyValue)) { // La expresión regular /\D/ verifica si el carácter es un número (\d) o no (\D). Si el carácter no es un número, la función event.preventDefault() evita que se escriba en el campo de entrada.
                    event.preventDefault()
                  }
                }}
                onChange={quantity => updatePriceQuantity({ quantity: quantity.target.value, index, item })}
                />
            </View>
          </View>
        </View>
      </ImageCard>
    </View>
      )
    }

    const renderFooter = () => {
      return (
      <View style = {styles.FRHeader}>

      </View>
      )
    }

    const renderEmptyProductsList = () => {
      if (loggedInUser) {
        return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
        )
      }
    }

    const createOrder = async () => {
      const quantitiesFiltered = quantities.filter((quantity, index) => quantities[index] > 0)
      const newOrder = {
        address: loggedInUser.address,
        restaurantId: restaurant.id,
        products: restaurant.products
          .filter((product, index) => quantities[index] > 0)
          .map((product, index) => ({
            productId: product.id,
            quantity: quantitiesFiltered[index]
          }))

        //          q = [1,0,0,0,0,12,0,0]
        //  qFiltered = [1,12]
        //    index      0,1,2,3,4,5,6,7,8
        //          p = [12,17]
        //   .map   p = [{productId: 12, quantity: 1},{}]
      }

      try {
        await create(newOrder)
        showMessage({
          message: 'Orden creada correctamente',
          type: 'success',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })

        setOrderToBeDimiss(null)
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } catch (error) {
        console.log(error)
        showMessage({
          message: 'No se pudo crear la orden',
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }

    return (
    <ScrollView>
    <FlatList
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyProductsList}
        style={styles.container}
        data={restaurant.products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={renderFooter}
      />
      <DeleteModalOrder
          isVisible={orderToBeDimiss !== null}
          onCancel={() => setOrderToBeDimiss(null)}
          onConfirm={() => createOrder()}>
        <TextRegular>Are you sure that you want to delete this order? </TextRegular>
        </DeleteModalOrder>
    </ScrollView>

    )
  } else {
    return (<TextRegular textStyle={styles.emptyList}>
    You must be logged in in order to see restaurant details.
  </TextRegular>
    )
  }
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  container: {
    flex: 1
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
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
    margin: 10
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
    marginRight: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: 'red'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  input: {
    height: '100'
  }
})
