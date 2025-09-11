// Test script to verify API client export
import('./src/lib/api/client.js').then(module => {
  console.log('API Client module:', module);
  console.log('API Client default:', module.default);
  console.log('API Client apiClient:', module.apiClient);
}).catch(error => {
  console.error('Error importing API client:', error);
});