declare var Nimiq;
import { Client, ClientNetwork } from '@nimiq/core-web';
import HubApi from '@nimiq/hub-api';
import { GlobalConfig } from './config';

interface NimiqHelper {
  client: Client;
  network: ClientNetwork;
  hub: HubApi;
  user: string;
}

const hubUrl = GlobalConfig.network === 'main' ? 'https://hub.nimiq.com' : 'https://hub.nimiq-testnet.com';

export const nimiq: NimiqHelper = {
  client: null,
  network: null,
  hub: new HubApi(hubUrl),
  user: null
};

let consensusResolver;
export const consensusEstablished = new Promise(resolve => (consensusResolver = resolve));

let loadedResolver;
export const nimiqLoaded = new Promise(resolve => (loadedResolver = resolve));

export function initializeNimiq() {
  // load nimiq library
  Nimiq.init(startConsensus);
}

async function startConsensus() {
  loadedResolver();

  if (GlobalConfig.network === 'main') {
    Nimiq.GenesisConfig.main();
  } else {
    Nimiq.GenesisConfig.test();
  }

  const configBuilder = Nimiq.Client.Configuration.builder();
  const client = configBuilder.instantiateClient();

  nimiq.client = client;
  nimiq.network = client.network;

  nimiq.client.waitForConsensusEstablished().then(() => {
    consensusResolver();
  });
}
