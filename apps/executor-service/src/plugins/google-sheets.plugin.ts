import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ActionPlugin } from '@flowforge/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleSheetsActionPlugin implements ActionPlugin {
  constructor(private readonly http: HttpService) {}

  getType() {
    return 'GOOGLE_SHEET_ROW';
  }

  async execute(config: Record<string, any>) {
    const { spreadsheetId, range, apiKey, values } = config;
    if (!spreadsheetId || !range || !apiKey || !values) {
      throw new Error('Google Sheets config incomplete');
    }
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range,
    )}:append?valueInputOption=${config.valueInputOption || 'USER_ENTERED'}&key=${apiKey}`;
    const body = { values: Array.isArray(values[0]) ? values : [values] };
    const response = await firstValueFrom(this.http.post(url, body));
    return { updatedRange: response.data?.updates?.updatedRange };
  }
}
