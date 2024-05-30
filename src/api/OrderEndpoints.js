import { get, post, put, destroy } from './helpers/ApiRequestsHelper'

function getMyOrders () {
  return get('orders')
}

function getOrderDetail (id) {
  return get(`orders/${id}`)
}

function getRestaurant (restaurantId) {
  return get(`restaurants/${restaurantId}`)
}

function create (data) {
  return post('orders', data)
}

function remove (id) {
  return destroy(`orders/${id}`)
}

function updateOrder (id, data) {
  return put(`orders/${id}`, data)
}
export { remove, create, updateOrder, getMyOrders, getOrderDetail, getRestaurant }
