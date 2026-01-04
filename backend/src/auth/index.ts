/**
 * Auth Module Public API
 *
 * Exports only what other modules should use.
 */

// Module
export { AuthModule } from './auth.module';
export { AuthService } from './auth.service';

// Guards
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { RolesGuard } from './guards/roles.guard';

// Decorators
export { Roles } from './decorators/roles.decorator';
export { Public, IS_PUBLIC_KEY } from './decorators/public.decorator';
export { CurrentUser } from './decorators/current-user.decorator';

// Interfaces - Auth context
export {
  AuthUser,
  AuthenticatedRequest,
  UserRole,
  toAuthUser,
} from './interfaces/auth-user.interface';

// Interfaces - Password hashing (for testing/mocking)
export { PASSWORD_HASHER, IPasswordHasher } from './interfaces/password-hasher.interface';

// Interfaces - Credentials (for testing/mocking)
export {
  CREDENTIAL_REPOSITORY,
  ICredentialRepository,
} from './credentials/credential-repository.interface';
export { Credential, CredentialType } from './credentials/credential.entity';

// Interfaces - Refresh Tokens (for testing/mocking)
export {
  REFRESH_TOKEN_REPOSITORY,
  IRefreshTokenRepository,
} from './refresh-tokens/refresh-token-repository.interface';
export { RefreshToken } from './refresh-tokens/refresh-token.entity';

// DTOs
export { RegisterUserDto, RegisterUserResponseDto } from './dto';
export { LoginDto, LoginResponseDto } from './dto';
export { RefreshTokenDto, RefreshTokenResponseDto } from './dto';

// Config
export { JwtPayload, getJwtConfig } from './config/jwt.config';

// Exceptions
export {
  PhoneNumberAlreadyRegisteredException,
  EmailAlreadyRegisteredException,
  InvalidPhoneNumberFormatException,
  WeakPasswordException,
  InvalidCredentialsException,
  AccountNotActiveException,
  InvalidRefreshTokenException,
  RefreshTokenExpiredException,
  RefreshTokenRevokedException,
} from './exceptions';
