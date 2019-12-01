import { selectDirectory, scanDirectory } from './lib/folders.js'
import { handleThumbnails } from './lib/thumbnails.js'

async function main () {
  const directory = await selectDirectory()
  const { files, allFiles } = await scanDirectory(directory)
  await handleThumbnails({ directory, files, allFiles })
}

main().catch(console.error)
