const fs = require("fs")
const cheerio = require("cheerio")

process("electoral-boundaries-2015")

async function process(name) {
  try {
    const data = await getSourceData(name)
    const formattedData = wrangleFeatures(data)
    await saveToFile(formattedData, name)
  } catch (error) {
    throw new Error(error)
  }
}

async function getSourceData(name) {
  try {
    const buffer = await fs.promises.readFile(`src/${name}.json`)
    const data = JSON.parse(buffer)
    return Promise.resolve(data)
  } catch (error) {
    throw new Error(error)
  }
}

async function saveToFile(data, name) {
  const str = JSON.stringify(data, null, 2)
  try {
    await fs.promises.mkdir("build", { recursive: true })
    await fs.promises.writeFile(`build/${name}.json`, str)
    return Promise.resolve()
  } catch (error) {
    throw new Error(error)
  }
}

function wrangleFeatures(data) {
  const copyCollection = { ...data }
  copyCollection.features = copyCollection.features.map((feature) => {
    const copyFeature = { ...feature }
    // parse feature description property for constituency name
    const $ = cheerio.load(copyFeature.properties.Description)
    // format name string
    const name = capitalizeStr($("tr:nth-child(2) td").text(), true)
    // format properties prop names to lowercase
    copyFeature.properties = {
      name,
      description: copyFeature.properties.Description,
    }
    return copyFeature
  })
  return copyCollection
}

function capitalizeStr(str, lower = false) {
  return (lower ? str.toLowerCase() : str).replace(
    /(?:^|\s|\-|["'([{])+\S/g,
    (match) => match.toUpperCase()
  )
}
