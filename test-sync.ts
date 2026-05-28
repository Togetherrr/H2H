import { syncWinsFromSources } from "./src/lib/wins/sync-wins";
syncWinsFromSources().then(console.log).catch(console.error);
