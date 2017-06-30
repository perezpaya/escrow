function assertError(error, s, message) {
  assert.isAbove(error.message.search(s), -1, message);
}

async function assertThrows(block, message, errorMessage) {
  try { await block() } catch (e) { return assertError(e, errorMessage, message) }
}

module.exports = {
  async assertJump(block, message = 'shoud have failed') {
    assertThrows(block, message, 'invalid JUMP')
  },

  async assertOpcode(block, message = 'shoud have failed') {
    assertThrows(block, message, 'invalid opcode')
  }
}
