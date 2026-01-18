import { ArgumentMetadata, BadRequestException, ValidationPipe } from '@nestjs/common';
import { UpdateMyUserProfileDto } from './user.dto';

describe('UpdateMyUserProfileDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it('should reject disallowed fields', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: UpdateMyUserProfileDto,
    };

    await expect(pipe.transform({ email: 'not-allowed@example.com' }, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });
});
