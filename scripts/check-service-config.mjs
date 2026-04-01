import { EasypanelClient } from './lib/easypanel.mts';

const client = new EasypanelClient({
  apiBaseUrl: 'https://vps10.riolabs.ai/api',
  apiToken: 'e590a9387b6628af8d14744eeb527e71ad394d7d66451b61bd046a7d17333172',
});

async function checkConfig() {
  try {
    const services = await client.findServices({
      projectId: 'riostack',
      type: 'compose',
    });

    const indigoService = services.find(s => s.name === 'indigo-studio' || s.name === 'indigo-strapi');

    if (indigoService) {
      console.log('Service found:', indigoService.name);
      console.log('ID:', indigoService.id);
      console.log('Type:', indigoService.type);
    } else {
      console.log('No indigo service found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkConfig();
