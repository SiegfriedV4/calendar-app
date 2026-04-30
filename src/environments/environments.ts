export const environment = {
  production: false,
  holidayApiKey: (import.meta as any).env?.NG_APP_HOLIDAY_API_KEY ?? '',
  holidayApiCountry: 'ZA',
};