var moment = require('moment')

module.exports = {
  getBalance(addr) {
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(addr, async (err, res) => {
        if (err || !res) return reject(err)
        resolve(res)
      })
    })
  },
  jump(duration) {
    return new Promise((resolve, reject) => {
      var params = duration.split(' ')
      params[0] = parseInt(params[0])

      var seconds = moment.duration.apply(moment, params).asSeconds()

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [seconds],
        id: new Date().getTime()
      }, async () => { resolve() })
    })
  }
}
