/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { getRestaurants } from '../../api/RestaurantEndpoints'
import { getPopular } from '../../api/ProductEndpoints'
import { showMessage } from 'react-native-flash-message'
import { flashStyle, flashTextStyle } from '../../styles/GlobalStyles'
import { FlatList, Text } from 'react-native-web'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import ImageCard from '../../components/ImageCard'

export default function RestaurantsScreen ({ navigation, route }) {
  // TODO: Create a state for storing the restaurants
  const [restaurants, setRestaurants] = useState([])
  const [popular, setPopular] = useState([])
  useEffect(() => {
    async function fetchRestaurants () {
      try {
        const fetchedRestaurants = await getRestaurants()
        setRestaurants(fetchedRestaurants)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving the restaurants. ${error}`,
          type: 'error',
          style: flashStyle,
          textStyle: flashTextStyle
        })
      }
    }
    fetchRestaurants()
  }, [route])

  // FR7 : Show top 3 products

  useEffect(() => {
    async function fetchPopular () {
      try {
        const fetchedPopular = await getPopular()
        setPopular(fetchedPopular)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving the popular products ${error}`,
          type: 'error',
          style: flashStyle,
          textStyle: flashTextStyle
        })
      }
    }
    fetchPopular()
  }, [])

  const renderRestaurant = ({ item }) => {
    return (
      <View style = {{ alignItems: 'flex-star' }}>
      <ImageCard
      imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : undefined}
      title={item.name}
      onPress={() => {
        navigation.navigate('RestaurantDetailScreen', { id: item.id })
      }}
      >
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceTime !== null && <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: 'red' }}>{item.averageServiceTime} min.</TextSemiBold></TextSemiBold>}
        <TextSemiBold>Shipping: <TextRegular style={{ color: 'red' }}>{item.shippingCosts.toFixed(2)} €</TextRegular></TextSemiBold>
      </ImageCard>
      </View>
    )
  }

  // FR7: Show top 3 products
  const renderPopular = ({ item }) => {
    return (
      <View style={styles.cardBody}>
        <Text style={styles.cardText}>{item.name}</Text>
        <ImageCard style ={{ }}
          imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : undefined}
        />
        <TextRegular>{item.description}</TextRegular>
        <TextSemiBold>{item.price.toFixed(2)}€</TextSemiBold>
      </View>
    )
  }

  const renderHeaderPopular = () => {
    return (
      <View style={styles.button}>
      <FlatList
        horizontal={true}
        data={popular}
        renderItem={renderPopular}
        />
        </View>
    )
  }

  const renderEmptyRestaurant = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        No restaurants were retreived. Are you logged in?
      </TextRegular>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        renderItem={renderRestaurant}
        ListEmptyComponent={renderEmptyRestaurant}
        ListHeaderComponent={renderHeaderPopular}
      />
    </View>
  )
}
// TODO: remove this style and the related <View>. Only for clarification purposes
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    height: 10,
    padding: 10,
    marginTop: 120,
    marginBottom: 120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: 50,
    maxWithd: 10
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  cardBody: {
    flex: 1,
    padding: 20,

    width: 136
  },
  cardText: {
    flex: 1,
    fontSize: 28,
    alignSelf: 'center'
  },
  restaurant: {
    flex: 5,
    padding: 10,
    alignItems: 'flex-start',
    width: 50
  }
})
