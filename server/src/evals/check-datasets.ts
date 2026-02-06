import 'dotenv/config';
import { Client } from 'langsmith';

const client = new Client();

async function checkDatasets() {
  console.log('Listing all datasets:\n');

  for await (const dataset of client.listDatasets()) {
    console.log('Dataset:', dataset.name);
    console.log('  ID:', dataset.id);
    console.log('  Example count:', (dataset as any).example_count ?? 'unknown');
    console.log('  Created:', dataset.created_at);
    console.log('');
  }
}

checkDatasets().catch(console.error);
