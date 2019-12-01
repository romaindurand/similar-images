import path from 'path'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import cliProgress from 'cli-progress'
import Limiter from 'async-limiter'
import imageJs from 'image-js'

import { log } from './logger.js'

const { Image } = imageJs

async function createThumbnails ({ files, directory }) {
  console.time('thumbnails')
  log('Building thumbnails ...')
  const bar1 = new cliProgress.SingleBar(
    { clearOnComplete: true },
    cliProgress.Presets.shades_classic
  )
  bar1.start(files.length, 0)
  let thumbnailsDone = 0
  const queue = new Limiter({ concurrency: 5 })
  const jobs = files.map(file => async done => {
    const image = await Image.load(path.join(directory, file))
    await image.resize({
      width: 20,
      height: 20
    }).save(path.join(directory, 'thumbnails', file))
    thumbnailsDone++
    bar1.update(thumbnailsDone)
    done()
  })
  queue.push(...jobs)
  await new Promise(resolve => {
    queue.onDone(resolve)
  })
  bar1.stop()
  log('Done')
  console.timeEnd('thumbnails')
}

async function shouldRebuildThumbnails ({ directory, allFiles }) {
  if (allFiles.includes('thumbnails')) {
    const { userAnswer } = await inquirer.prompt({
      type: 'list',
      name: 'userAnswer',
      message: 'Thumbnails already exists, rebuild ?',
      choices: ['No', 'Yes']
    })
    log({ userAnswer })
    const rebuildThumbnails = userAnswer === 'Yes'
    if (!rebuildThumbnails) return false
    log('Deleting existing thumbnails ...')
    await fs.emptyDir(path.join(directory, 'thumbnails'))
    log('Done')
  } else {
    await fs.mkdir(path.join(directory, 'thumbnails'))
  }
  return true
}

export async function handleThumbnails ({ directory, files, allFiles }) {
  if (!await shouldRebuildThumbnails({ directory, allFiles })) return
  await createThumbnails({ files, directory })
}
