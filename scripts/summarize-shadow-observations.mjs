import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { summarizeObservations } from '../engines/shadow/observation-summary.mjs';

const dir = new URL('../test-data/shadow/observations/', import.meta.url);
const records = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.json')).map((file) => JSON.parse(readFileSync(new URL(file, dir), 'utf8'))) : [];
console.log(JSON.stringify(summarizeObservations(records), null, 2));
