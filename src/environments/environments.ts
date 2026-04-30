
export const environment = {
  production: false,
  holidayApiCountry: 'ZA',
  holidayApiKey: (import.meta as any).env['NG_APP_HOLIDAY_API_KEY'] ?? '',
};