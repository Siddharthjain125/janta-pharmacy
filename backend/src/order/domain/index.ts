export { OrderStatus, ORDER_STATUS_METADATA, isTerminalStatus } from './order-status';

export {
  canTransition,
  getAllowedTransitions,
  validateTransition,
  canCancel,
  isPaid,
  isModifiable,
  type TransitionValidation,
} from './order-state-machine';
