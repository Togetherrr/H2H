import { fetchMusicShowWinsFromWikipediaShowLists, fetchAwardCeremonyWinsFromWikipedia } from "../src/lib/wins/wins-sources"

async function run() {
  console.log("Fetching music show wins from Wikipedia...")
  try {
    const musicShowWins = await fetchMusicShowWinsFromWikipediaShowLists()
    console.log(`Fetched ${musicShowWins.length} music show wins:`)
    console.log(JSON.stringify(musicShowWins.slice(0, 10), null, 2))
  } catch (err) {
    console.error("Error fetching music show wins:", err)
  }

  console.log("\nFetching award ceremony wins from Wikipedia...")
  try {
    const awardWins = await fetchAwardCeremonyWinsFromWikipedia()
    console.log(`Fetched ${awardWins.length} award ceremony wins:`)
    console.log(JSON.stringify(awardWins.slice(0, 10), null, 2))
  } catch (err) {
    console.error("Error fetching award ceremony wins:", err)
  }
}

run()
