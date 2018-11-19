module.exports = {
  generatePermutations: (elements) => {
   return generate(elements.length, elements) 
  }
}

const generate = (n, elements) => {
  if (n === 1) return [[...elements]] 

  let output = []
  for(let i=0; i<n-1; i++) {
    output =  output.concat(generate(n-1, elements))
    if (n % 2 === 0) swap(elements, i, n-1)
    else swap(elements, 0, n-1)
  }
  return output.concat(generate(n-1, elements))
}

const swap = (elements, i, j) => {
  const temp = elements[i]
  elements[i] = elements[j]
  elements[j] = temp
}
