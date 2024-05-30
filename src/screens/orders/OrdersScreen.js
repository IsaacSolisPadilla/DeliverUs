import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import { flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import { getMyOrders, remove } from '../../api/OrderEndpoints'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import ImageCard from '../../components/ImageCard'
import { FlatList } from 'react-native-web'
import TextRegular from '../../components/TextRegular'
import TextSemibold from '../../components/TextSemibold'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as GlobalStyles from '../../styles/GlobalStyles'
import DeleteModal from '../../components/DeleteModal'

export default function OrdersScreen ({ navigation }) {
  const [orders, setOrders] = useState([])
  const { loggedInUser } = useContext(AuthorizationContext)
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    }
  }, [loggedInUser])

  async function fetchOrders () {
    try {
      const fetchedOrders = await getMyOrders()
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving the orders. ${error}`,
        type: 'error',
        style: flashStyle,
        textStyle: flashTextStyle
      })
    }
  }

  const removeOrder = async (order) => {
    try {
      await remove(order.id)
      await fetchOrders()
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.id} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.id} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderOrders = ({ item }) => {
    if (item.status === 'pending') {
      return (

        <ImageCard
          imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : undefined}
          onPress={() => {
            navigation.navigate('OrderDetailScreen', { id: item.id, dirty: true })
          }}
        >
            <View style={{ marginLeft: 10 }}>
        <TextSemibold textStyle={{ fontSize: 16, color: 'black' }}>Order {item.id}</TextSemibold>
        <TextSemibold>Created at: <TextRegular numberOfLines={2}>{item.createdAt}</TextRegular></TextSemibold>
        <TextSemibold>Price: <TextRegular style={{ color: 'black' }}>{item.price.toFixed(2)} €</TextRegular></TextSemibold>
        <TextSemibold>Shipping: <TextRegular style={{ color: 'black' }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemibold>
        <TextSemibold>Status: <TextRegular style={{ color: 'black' }}>{item.status}</TextRegular></TextSemibold>
      </View>
      <View style={styles.actionButtonsContainer}>
          <Pressable
    onPress={() => navigation.navigate('EditOrderScreen', { id: item.id })}
    style={({ pressed }) => [
      {
        backgroundColor: pressed
          ? GlobalStyles.brandBlueTap
          : GlobalStyles.brandBlue
      },
      styles.actionButton
    ]}>
    <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
      <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
      <TextRegular textStyle={styles.text}>
        Edit
      </TextRegular>
    </View>
  </Pressable>

  <Pressable
    onPress={() => { setOrderToBeDeleted(item) }}
    style={({ pressed }) => [
      {
        backgroundColor: pressed
          ? GlobalStyles.brandPrimaryTap
          : GlobalStyles.brandPrimary
      },
      styles.actionButton
    ]}>
    <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
      <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
      <TextRegular textStyle={styles.text}>
        Delete
      </TextRegular>
    </View>
  </Pressable>
          </View>
        </ImageCard>

      )
    } else {
      return (

        <ImageCard
          imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : undefined}
          onPress={() => {
            navigation.navigate('OrderDetailScreen', { id: item.id, dirty: true })
          }}
        >
            <View style={{ marginLeft: 10 }}>
        <TextSemibold textStyle={{ fontSize: 16, color: 'black' }}>Order {item.id}</TextSemibold>
        <TextSemibold>Created at: <TextRegular numberOfLines={2}>{item.createdAt}</TextRegular></TextSemibold>
        <TextSemibold>Price: <TextRegular style={{ color: 'black' }}>{item.price.toFixed(2)} €</TextRegular></TextSemibold>
        <TextSemibold>Shipping: <TextRegular style={{ color: 'black' }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemibold>
        <TextSemibold>Status: <TextRegular style={{ color: 'black' }}>{item.status}</TextRegular></TextSemibold>
      </View>

        </ImageCard>

      )
    }
  }

  const renderEmptyOrder = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No orders were retreived. Are you logged in?
      </TextRegular>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        data={orders}
        renderItem={renderOrders}
        ListEmptyComponent={renderEmptyOrder}
        keyExtractor={item => item.id.toString()}
        />
<DeleteModal
  isVisible={orderToBeDeleted !== null}
  onCancel={() => setOrderToBeDeleted(null)}
  onConfirm={() => removeOrder(orderToBeDeleted)}>
    <TextRegular>Are you sure that you want to delete this order? </TextRegular>
</DeleteModal>
    </View>
  )
}

// TODO: remove this style and the related <View>. Only for clarification purposes
const styles = StyleSheet.create({
  FRHeader: {
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    height: 20,
    margin: 8,
    marginLeft: 50,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 8,
    margin: '1%',
    padding: 10,
    alignSelf: 'flex-end',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  },
  emptyList: {
    color: 'black',
    // margin: 250,
    marginLeft: 500,
    marginTop: 249

  }
})
