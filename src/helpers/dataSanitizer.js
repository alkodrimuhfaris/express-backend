function sanitize (word) {
  return word.replace(/'/g, "\\'").replace(/"/g, '\\"').trim()
}

module.exports = sanitize
