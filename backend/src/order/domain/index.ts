export {
  OrderStatus,
  ORDER_STATUS_METADATA,
  isTerminalStatus,
  isMutableStatus,
  isDraftOrder,
} from './order-status';

export {
  canTransition,
  getAllowedTransitions,
  validateTransition,
  canCancel,
  isPaid,
  isModifiable,
  canModifyItems,
  canPlaceOrder,
  canConfirmOrder,
  type TransitionValidation,
} from './order-state-machine';

export {
  type OrderItem,
  type CreateOrderItemData,
  createOrderItem,
  updateOrderItemQuantity,
  calculateItemSubtotal,
  orderItemToDTO,
} from './order-item';

export {
  type DomainEvent,
  type OrderConfirmedEvent,
  createOrderConfirmedEvent,
  DomainEventCollector,
} from './domain-events';