pragma solidity ^0.4.11;

import "zeppelin/ownership/Ownable.sol";
import "./ArrayUtils.sol";

contract BasicInheritance is Ownable {
  using ArrayUtils for address[];

  string public description;

  function BasicInheritance(string _description, uint _timeUntilUnlock) {
    description = _description;
    lastOwnerNotice = block.timestamp;
    timeUntilUnlock = _timeUntilUnlock;
  }

  address[] beneficiaries;
  uint public lastOwnerNotice;
  uint public timeUntilUnlock;

  function () payable updateOwnerNotice {
    processDeposit();
  }

  function widthdraw(uint value) onlyOwner updateOwnerNotice {
    uint amount = this.balance > value ? value : this.balance;
    msg.sender.transfer(amount);
    Withdrawal(amount, msg.sender);
  }

  function processDeposit() internal {
    Deposit(msg.value, msg.sender);
  }

  function getBeneficiaries() public constant returns (address[]) {
    return beneficiaries;
  }

  function addBeneficiary(address beneficiary) onlyOwner updateOwnerNotice {
    beneficiaries.push(beneficiary);
    NewBeneficiary(beneficiary);
  }

  function removeBeneficiary(address beneficiary) onlyOwner updateOwnerNotice {
    removeBeneficiaryByAddress(beneficiary);
    BeneficiaryRemoved(beneficiary);
  }

  function getAvailableBalance() onlyBeneficiaries public constant returns (uint) {
    return isUnlocked() ? (this.balance / beneficiaries.length) : 0;
  }

  function beneficiaryCashOut() onlyIfUnlocked onlyBeneficiaries {
    uint availableBalance = getAvailableBalance();
    removeBeneficiaryByAddress(msg.sender);
    msg.sender.transfer(availableBalance);
    BeneficiaryRemoved(msg.sender);
    Withdrawal(availableBalance, msg.sender);
  }

  function removeBeneficiaryByAddress(address beneficiary) internal {
    beneficiaries.removeByValue(beneficiary);
  }

  function isUnlocked() public constant returns (bool) {
    return block.timestamp >= timeUntilUnlock + lastOwnerNotice;
  }
  
  function updateLastOwnerNotice() onlyOwner public {
    lastOwnerNotice = block.timestamp;
  }

  function endContract() onlyOwner {
    selfdestruct(msg.sender);
  }

  modifier updateOwnerNotice() {
    if (msg.sender == owner) { updateLastOwnerNotice(); }
    _;
  }

  modifier onlyBeneficiariesOrOwner() {
    require(msg.sender == owner || beneficiaries.includes(msg.sender));
    _;
  }

  modifier onlyBeneficiaries() {
    require(beneficiaries.includes(msg.sender));
    _;
  }

  modifier onlyIfUnlocked() {
    require(isUnlocked());
    _;
  }

  event Deposit(uint value, address fiduciary);
  event Withdrawal(uint value, address fiduciary);
  event NewBeneficiary(address beneficiary);
  event BeneficiaryRemoved(address beneficiary);
}
