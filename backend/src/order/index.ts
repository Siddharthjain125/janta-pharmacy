// Module
export { OrderModule } from './order.module';

// Services
export { OrderService } from './order.service';
export { CartService } from './cart.service';

// DTOs
export {
  OrderDto,
  OrderItemDto,
  OrderPriceDto,
  CreateOrderDto,
  ListOrdersQueryDto,
  AddItemToCartDto,
  UpdateItemQuantityDto,
} from './dto/order.dto';

// Domain
export {
  OrderStatus,
  ORDER_STATUS_METADATA,
  isTerminalStatus,
  isMutableStatus,
  isDraftOrder,
  canTransition,
  getAllowedTransitions,
  validateTransition,
  canCancel,
  isPaid,
  isModifiable,
  canModifyItems,
  canPlaceOrder,
} from './domain';

// Domain - OrderItem
export {
  type OrderItem,
  type CreateOrderItemData,
  createOrderItem,
  updateOrderItemQuantity,
  calculateItemSubtotal,
  orderItemToDTO,
} from './domain';

// Repository
export {
  ORDER_REPOSITORY,
  type IOrderRepository,
} from './repositories/order-repository.interface';

// Exceptions
export {
  OrderNotFoundException,
  UnauthorizedOrderAccessException,
  InvalidOrderStateTransitionException,
  OrderTerminalStateException,
  OrderCannotBeCancelledException,
  OrderNotConfirmedException,
  OrderAlreadyConfirmedException,
  DraftOrderAlreadyExistsException,
  NoDraftOrderException,
  OrderNotDraftException,
  OrderItemNotFoundException,
  InvalidQuantityException,
  EmptyCartException,
} from './exceptions/order.exceptions';
