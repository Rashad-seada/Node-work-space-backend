const OrderRepository = require("../repo/order-repo");
const OrderItemRepository = require("../repo/order-item-repo");
const InventoryService = require("../../inventory/service/inventory-service");
const TreasuryService = require("../../treasury/services/treasury-service");
const HistoryService = require("../../history/service/history-service");

class OrderService {
  async createOrder(clientId, orderItems,userId) {
    const totalPrice = await Promise.all(
        orderItems.map(async (item) => {
          const inventory = await InventoryService.findInventoryItemById(item.inventoryItemId);
          if (!inventory || inventory.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for inventory item: ${item.inventoryItemId}`);
          }
          return inventory.sellingPricePerUnit * item.quantity;
        })
    ).then((prices) => prices.reduce((sum, price) => sum + price, 0));

    await HistoryService.createHistory(userId,"ORDERED","order has been placed");

    return await OrderRepository.createOrder({
      clientId,
      totalPrice,
      paymentStatus: "PENDING",
      orderItems,
    });
  }

  async payOrder(orderId, paymentMethod,userId) {

    const order = await OrderRepository.findOrderById(orderId);

    if (!order) throw new Error("Order not found.");

    if (order.paymentStatus === "PAID") throw new Error("Order is already paid.");

    await Promise.all(
        order.orderItems.map(async (item) => {
          console.log(item.inventoryItemId)

          await InventoryService.consumeInventoryStock(item.inventoryItemId, item.quantity);
        })
    );

    await TreasuryService.createOrderTransaction(order.totalPrice ,paymentMethod)

    await OrderRepository.updateOrder(orderId, { paymentStatus: "PAID", paymentMethod });

    await HistoryService.createHistory(userId,"ORDER_PAID","order has been paid");

    return order;
  }

  async getOrdersByClientId(clientId) {
    return await OrderRepository.findOrdersByClientId(clientId);
  }

  async getAllOrders(query,page,size) {
    return await OrderRepository.findAllOrders(query,page,size);
  }

  async getOrderById(id){
    return await OrderRepository.findOrderById(id);
  }

  async deleteOrder(orderId,userId) {
    const order = await OrderRepository.findOrderById(orderId);
    if (!order) throw new Error("Order not found.");
    if (order.paymentStatus !== "PENDING") throw new Error("Cannot delete a paid order.");

    await HistoryService.createHistory(userId,"ORDER_DELETED","order has been deleted");

    await OrderRepository.deleteOrder(orderId);
  }

  async addOrderItem(orderId, orderItemData) {
    const order = await OrderRepository.findOrderById(orderId);
    if (!order) throw new Error("Order not found.");
    if (order.paymentStatus !== "PENDING") throw new Error("Cannot add items to a paid order.");

    const inventory = await InventoryService.findInventoryItemById(orderItemData.inventoryItemId);
    if (!inventory || inventory.stockQuantity < orderItemData.quantity) {
      throw new Error(`Insufficient stock for inventory item: ${orderItemData.inventoryItemId}`);
    }

    const orderItemPrice = inventory.sellingPricePerUnit * orderItemData.quantity;

    await OrderItemRepository.addOrderItem({
      orderId,
      ...orderItemData,
    });

    const updatedTotalPrice = parseFloat(order.totalPrice) + orderItemPrice;
    await OrderRepository.updateOrder(orderId, { totalPrice: updatedTotalPrice });

    return await OrderRepository.findOrderById(orderId);
  }

  async removeOrderItem(orderItemId) {
    // Find the order item by ID
    const orderItem = await OrderItemRepository.findOrderItemById(orderItemId);
    if (!orderItem) throw new Error("Order item not found.");

    // Retrieve the associated order
    const order = await OrderRepository.findOrderById(orderItem.orderId);
    if (!order) throw new Error("Order not found.");
    if (order.paymentStatus !== "PENDING") throw new Error("Cannot remove items from a paid order.");

    // Fetch inventory details
    const inventory = await InventoryService.findInventoryItemById(orderItem.inventoryItemId);
    if (!inventory) throw new Error(`Inventory item not found: ${orderItem.inventoryItemId}`);

    // Calculate the price of the order item
    const orderItemPrice = inventory.sellingPricePerUnit * orderItem.quantity;

    // Delete the order item
    await OrderItemRepository.deleteOrderItem(orderItemId);

    // Update the order's total price
    const updatedTotalPrice = parseFloat(order.totalPrice) - orderItemPrice;
    await OrderRepository.updateOrder(order.id, { totalPrice: updatedTotalPrice });

    // Return the updated order
    return await OrderRepository.findOrderById(order.id);
  }

  async findPreparingOrderItems() {
    return await OrderItemRepository.findPreparingOrderItems()
  }

  async markOrderAsReady(orderId) {
    return await OrderItemRepository.markOrderAsReady(orderId)
  }

}

module.exports = new OrderService();
