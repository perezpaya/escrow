const { assertJump, assertOpcode } = require('./helpers/assert_utils')
const { getBalance, jump } = require('./helpers/rpc_utils')

const BasicInheritance = artifacts.require('BasicInheritance')

contract('BasicInheritance', function(accounts) {
  beforeEach(async () => {
    bi = await BasicInheritance.new('A basic inheritance test contract', 1000)
  })

  describe('#()', async() => {
    it('can receive funds', async () => {
      await bi.send(10)
      assert.equal(await getBalance(bi.address), 10, 'should have received balance')
    })
  })

  describe('#withdraw()', async() => {
    it('can withdraw funds', async () => {
      await bi.send(10)
      await bi.withdraw(10)
      assert.equal(await getBalance(bi.address), 0, 'should have withdrawed balance')
    })

    it('can withdraw partial funds', async () => {
      await bi.send(10)
      await bi.withdraw(5)
      assert.equal(await getBalance(bi.address), 5, 'should have withdrawed partial balance')
    })

    it('withdraws total funds if execs total', async () => {
      await bi.send(10)
      await bi.withdraw(12)
      assert.equal(await getBalance(bi.address), 0, 'should have withdrawed total balance')
    })

    it('can not withdraw funds without being owner', async () => {
      await bi.send(10)
      assertOpcode(async () => {
        await bi.withdraw(5, {from: accounts[1]})
      }, 'should throw error when withdrawing from a non owner address')
    })
  })

  describe('#isUnlocked()', function () {
    it('it is locked if time has not passed', async () => {
      assert.equal(await bi.isUnlocked.call(), false, 'should not be unlocked')
    })

    it('it is unlocked if time has passed', async () => {
      jump('1 day', async () => {
        assert.equal(await bi.isUnlocked.call(), true, 'should be unlocked')
      })
    })
  })

  describe('#getBeneficiaries()', function (){
    it('adds a beneficiary', async () => {
      await bi.addBeneficiary(accounts[1])
      beneficiaries = await bi.getBeneficiaries.call()
      assert.equal(beneficiaries.indexOf(accounts[1]) >= 0, true, 'should include added beneficiary')
    })
  })

  describe('#addBeneficiary()', function (){
    it('is restricted to owner', async () => {
      assertOpcode(async () => {
        await bi.addBeneficiary(0x0, {from: accounts[1]})
      }, 'should throw error when adding beneficiary from a non owner address')
    })

    it('adds a beneficiary', async () => {
      await bi.addBeneficiary(accounts[1])
      beneficiaries = await bi.getBeneficiaries.call()
      assert.equal(beneficiaries.indexOf(accounts[1]) >= 0, true, 'should include added beneficiary')
    })
  })

  describe('#removeBeneficiary()', function () {
    it('is restricted to owner', async () => {
      await bi.addBeneficiary(accounts[1])
      assertOpcode(async () => {
        await bi.removeBeneficiary(accounts[1], { from: accounts[2] })
      }, 'should throw error when removing beneficiary from a non owner address')
    })

    it('can not remove non existing beneficieries', async () => {
      assertOpcode(async () => {
        await bi.removeBeneficiary(0x0)
      }, 'should throw error when removing non existing beneficiary')
    })

    it('removes a beneficiary', async () => {
      await bi.addBeneficiary(accounts[1])
      await bi.removeBeneficiary(accounts[1])
      beneficiaries = await bi.getBeneficiaries.call()
      assert.equal(beneficiaries.indexOf(accounts[2]) == -1, true, 'should not include removed beneficiary')
    })
  })

  describe('#getAvailableBalance()', function () {
    it('fails when withdrawal is not unlocked', async () => {
      assert.equal(await bi.isUnlocked.call(), false, 'should not be unlocked')
      assertOpcode(async () => {
        await bi.getAvailableBalance()
      }, 'should throw error when adding beneficiary from a non owner address')
    })

    it('is restricted to beneficiary and owner', async () => {
      jump('1 day', async () => {
        assert.equal(await bi.isUnlocked.call(), true, 'should be unlocked')
        assertOpcode(async () => {
          await bi.getAvailableBalance({ from: accounts[2] })
        }, 'should throw error when getting available balance from a non beneficiary')
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
