import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

@Injectable()
export class ImageScanService {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async parseReceipt(imageUrl: string): Promise<any> {
    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    const messages: Array<{ role: 'user'; content: any }> = [
      { role: 'user', content: 'Parse details from the receipt' },
      {
        role: 'user',
        content: [{ type: 'image_url', image_url: { url: imageUrl } }],
      },
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      response_format: { type: 'json_object' },
    });

    return response.choices[0].message.content;
  }
}
