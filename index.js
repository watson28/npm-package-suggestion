const querystring = require('querystring')
const promisify = require("promisify-node")
const NpmRegistryClient = require('npm-registry-client')
const EventEmitter = require('events')
const { generatePermutations } = require('./heapAlgorithm')
const client = promisify(new NpmRegistryClient({}))
const NPM_PKG_SEARCH_URL = 'https://registry.npmjs.org/-/v1/search'

const packageNamesCache = new Set()

const main = () => {
  const packageName = process.argv[2]
  if (!packageName) throw new Error('A package name is required.')

  if (!doesPackageNameExist(packageName)) {
    console.log(`${packageName} is available`)
    return
  }

  console.log('available suggestions:')
  generateSuggestions(packageName)
  .on('foundSuggestion', console.log)

}
const executeSearch = (packageName) => {
  const query = querystring.stringify({ text: packageName })
  return client.get(`${NPM_PKG_SEARCH_URL}?${query}`, { staleOk: true })
    .then(result => result.objects.map(package => package.package.name))
    .then(packageNames => {
      packageNames.forEach(packageName => packageNamesCache.add(packageName))
      return packageNames
    })
}

const doesPackageNameExist = async (name) => {
  if (packageNamesCache.has(name)) return true
  
  const searchResult = await executeSearch(name)
  return searchResult.some(packageName => packageName === name)
}

const generateSuggestions = (packageName) => {
  const eventEmitter = new EventEmitter()
  const tokens = packageName.split('-')

  generatePermutations(tokens).forEach(permutation => {
    const suggestion = permutation.join('-')
    doesPackageNameExist(suggestion).then(result => {
      if (!result) eventEmitter.emit('foundSuggestion', suggestion)
    })
  })

  return eventEmitter

}

main()
