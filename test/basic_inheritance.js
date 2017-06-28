const assertJump = require('./helpers/assertJump');
const assertOpcode = require('./helpers/assertOpcode');

const BasicInheritance = artifacts.require('BasicInheritance')

contract('BasicInheritance', function(accounts) {
  beforeEach(async () => {
    bi = await BasicInheritance.new('A basic inheritance test contract')
  })

  describe('()', async() => {
    it('can receive funds', async () => {
      await bi.send(10)
      assert.equal(await bi.depositedAmount(), 10, 'should have received balance')
    })
  })

  describe('.addBeneficiary()', function (){
    it('is restricted to owner', async () => {
      try {
        await bi.addBeneficiary(0x0, {from: accounts[1]})
      } catch(e) {
        assertOpcode(e, 'should throw error when adding beneficiary from a non owner address')
      }
    })

    it('adds a beneficiary', async () => {
      await bi.addBeneficiary(accounts[1])
      beneficiaries = await bi.getBeneficiaries.call()
      assert.equal(beneficiaries.indexOf(accounts[1]) >= 0, true, 'should include added beneficiary')
    })
  })

  describe('.getAvailableBalance()', function () {
    it('is restricted to beneficiary and owner', async () => {
      try {
        await bi.getAvailableBalance({from: accounts[2]})
      } catch(e) {
        assertOpcode(e, 'should throw error when adding beneficiary from a non owner address')
      }
    })

    it('returns available balance', async () => {
      await bi.addBeneficiary(accounts[1])
      await bi.send(10)
      // TODO: Change this by checking contract balance with web3
      assert.equal(await bi.depositedAmount(), 10, 'should have received balance')
    })
  })
});
