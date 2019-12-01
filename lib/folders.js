import path from 'path'
import fs from 'fs-extra'
import drivelist from 'drivelist'
import inquirer from 'inquirer'
import inquirerSelectDirectory from 'inquirer-select-directory'

import { log } from './logger.js'

const modulePath = path.join(import.meta.url, '../..').replace('file:\\', '')
log({ modulePath })

export async function selectDrive () {
  const drives = await drivelist.list()
  const { drive } = await inquirer.prompt({
    type: 'list',
    name: 'drive',
    message: 'Select a disk',
    choices: drives.map(drive => drive.mountpoints[0].path)
  })
  log({ drive })
  return drive
}

export async function selectDirectory () {
  inquirer.registerPrompt('directory', inquirerSelectDirectory)
  const config = await getConfig()
  log({ config })
  if (config.directory) {
    const { useLast } = await inquirer.prompt({
      name: 'useLast',
      type: 'list',
      message: `Do you want to use the last selected folder ? (${config.directory})`,
      choices: ['Yes', 'No']
    })
    log({ useLast })
    if (useLast === 'Yes') return config.directory
  }
  const drive = await selectDrive()

  const { directory } = await inquirer.prompt({
    type: 'directory',
    message: 'Select a directory',
    name: 'directory',
    basePath: drive
  })
  log({ directory })
  const configPath = path.join(modulePath, 'config.json')
  log({ configPath })
  await fs.writeJSON(configPath, { directory })
  return directory
}

async function getConfig () {
  const configPath = path.join(modulePath, 'config.json')
  log({ configPath })
  const configExists = fs.existsSync(configPath)
  log({ configExists })
  if (!configExists) return {}
  const config = await fs.readJson(configPath)
  return config
}

export async function scanDirectory (directory) {
  const fileTypes = ['png', 'bmp', 'jpg', 'jpeg', 'webp']
  console.time('directory_scan')
  const allFiles = await fs.readdir(directory)
  log({ allFiles })
  const files = allFiles.filter(file => fileTypes.some(fileType => file.endsWith(fileType)))
  console.timeEnd('directory_scan')
  log({ files })
  return { files, allFiles }
}
