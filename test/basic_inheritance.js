const assertJump = require('./helpers/assert_jump')
const assertOpcode = require('./helpers/assert_opcode')

const BasicInheritance = artifacts.require('BasicInheritance')

const { getBalance, jump } = require('./helpers/web3')

contract('BasicInheritance', function(accounts) {
  beforeEach(async () => {
    bi = await BasicInheritance.new('A basic inheritance test contract', 1000)
  })

  describe('()', async() => {
    it('can receive funds', async () => {
      await bi.send(10)
      assert.equal(await getBalance(bi.address), 10, 'should have received balance')
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

  describe('.getBeneficiaries()', function (){
    it('adds a beneficiary', async () => {
      await bi.addBeneficiary(accounts[1])
      beneficiaries = await bi.getBeneficiaries.call()
      assert.equal(beneficiaries.indexOf(accounts[1]) >= 0, true, 'should include added beneficiary')
    })
  })

  describe('.removeBeneficiary()', function () {
    it('is restricted to owner', async () => {
      await bi.addBeneficiary(accounts[1])
      try {
        await bi.removeBeneficiary(accounts[1], { from: accounts[2] })
      } catch(e) {
        assertOpcode(e, 'should throw error when removing beneficiary from a non owner address')
      }
    })

    it('can not remove non existing beneficieries', async () => {
      try {
        await bi.removeBeneficiary(0x0)
      } catch(e) {
        assertOpcode(e, 'should throw error when removing non existing beneficiary')
      }
    })

    it('removes a beneficiary', async () => {
      await bi.addBeneficiary(accounts[1])
      await bi.removeBeneficiary(accounts[1])
      beneficiaries = await bi.getBeneficiaries.call()
      assert.equal(beneficiaries.indexOf(accounts[2]) == -1, true, 'should not include removed beneficiary')
    })
  })

  describe('.isUnlocked()', function () {
    it('it is locked if time has not passed', async () => {
      assert.equal(await bi.isUnlocked.call(), false, 'should not be unlocked')
    })

    it('it is unlocked if time has passed', async () => {
      jump('1 day', async () => {
        assert.equal(await bi.isUnlocked.call(), true, 'should be unlocked')
      })
    })
  })

  describe('.getAvailableBalance()', function () {
    it('fails when withdrawal is not unlocked', async () => {
      assert.equal(await bi.isUnlocked.call(), false, 'should not be unlocked')
      try {
        await bi.getAvailableBalance()
      } catch(e) {
        assertOpcode(e, 'should throw error when adding beneficiary from a non owner address')
      }
    })

    it('is restricted to beneficiary and owner', async () => {
      jump('1 day', async () => {
        assert.equal(await bi.isUnlocked.call(), true, 'should be unlocked')
        try {
          await bi.getAvailableBalance({ from: accounts[2] })
        } catch(e) {
          assertOpcode(e, 'should throw error when getting available balance from a non beneficiary')
        }
      })
    })

    it('returns available balance for unique beneficiary', async () => {
      jump('1 day', async () => {
        await bi.addBeneficiary(accounts[1])
        await bi.send(10)
        assert.equal(await getBalance(bi.address), 10, 'should have received balance')
        assert.equal(await bi.getAvailableBalance(), 10, 'should have received balance')
      })
    })

    it('returns available balance for unique beneficiary', async () => {
      jump('1 day', async () => {
        await bi.addBeneficiary(accounts[1])
        await bi.addBeneficiary(accounts[2])
        await bi.send(10)
        assert.equal(await getBalance(bi.address), 10, 'should have received balance')
        assert.equal(await bi.getAvailableBalance(), 5, 'should have received balance')
      })
    })
  })
});
