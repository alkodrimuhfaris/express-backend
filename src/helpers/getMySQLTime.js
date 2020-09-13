const getTime = () => {
  let a = new Date().toISOString().slice(0, 19).replace('T', ' ')
  return a
}

module.exports = getTime
