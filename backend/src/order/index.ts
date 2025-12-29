// Module
export { OrderModule } from './order.module';

// Service
export { OrderService } from './order.service';

// DTOs
export { OrderDto, CreateOrderDto, ListOrdersQueryDto } from './dto/order.dto';

// Domain
export {
  OrderStatus,
  ORDER_STATUS_METADATA,
  isTerminalStatus,
  canTransition,
  getAllowedTransitions,
  validateTransition,
  canCancel,
  isPaid,
  isModifiable,
} from './domain';

// Exceptions
export {
  OrderNotFoundException,
  UnauthorizedOrderAccessException,
  InvalidOrderStateTransitionException,
  OrderTerminalStateException,
  OrderCannotBeCancelledException,
  OrderNotConfirmedException,
  OrderAlreadyConfirmedException,
} from './exceptions/order.exceptions';
