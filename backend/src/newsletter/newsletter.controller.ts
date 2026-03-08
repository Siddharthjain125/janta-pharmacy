import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse } from '../common/api/api-response';
import { SubscribeNewsletterDto, NewsletterSubscribeResponseDto } from './dto';
import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  async subscribe(
    @Body() dto: SubscribeNewsletterDto,
  ): Promise<ApiResponse<NewsletterSubscribeResponseDto>> {
    await this.newsletterService.subscribe(dto.email);
    return ApiResponse.success({ success: true }, 'Subscribed successfully');
  }
}
