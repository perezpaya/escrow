pragma solidity ^0.4.11;

import "zeppelin/ownership/Ownable.sol";
import "./ArrayUtils.sol";

contract BasicInheritance is Ownable {
  using ArrayUtils for address[];

  string public description;

  function BasicInheritance(string _description, uint _timeUntilUnlock) {
    description = _description;
    timeUntilUnlock = _timeUntilUnlock;
    lastHeartbeat = block.timestamp;
  }

  address[] beneficiaries;
  uint public lastHeartbeat;
  uint public timeUntilUnlock;

  function () payable sendHeartbeat {
    processDeposit();
  }

  function withdraw(uint value) onlyOwner sendHeartbeat {
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

  function addBeneficiary(address beneficiary) onlyOwner sendHeartbeat {
    beneficiaries.push(beneficiary);
    NewBeneficiary(beneficiary);
  }

  function removeBeneficiary(address beneficiary) onlyOwner sendHeartbeat {
    removeBeneficiaryByAddress(beneficiary);
    BeneficiaryRemoved(beneficiary);
  }

  function getAvailableBalance() onlyBeneficiaries public constant returns (uint) {
    return isUnlocked() ? (this.balance / beneficiaries.length) : 0;
  }

  function withdrawBeneficiary() onlyIfUnlocked onlyBeneficiaries {
    uint availableBalance = getAvailableBalance();
    removeBeneficiaryByAddress(msg.sender);
    msg.sender.transfer(availableBalance);
    BeneficiaryRemoved(msg.sender);
    Withdrawal(availableBalance, msg.sender);
  }

  function removeBeneficiaryByAddress(address beneficiary) internal {
    beneficiaries.removeByValue(beneficiary);
  }

  function isBeneficiary(address beneficiary) public constant returns (bool) {
    return beneficiaries.includes(beneficiary);
  }

  function isUnlocked() public constant returns (bool) {
    return block.timestamp >= (timeUntilUnlock + lastHeartbeat);
  }

  function heartbeat() onlyOwner public {
    lastHeartbeat = block.timestamp;
  }

  function endContract() onlyOwner {
    selfdestruct(msg.sender);
  }

  modifier sendHeartbeat() {
    if (owner == msg.sender) heartbeat();
    _;
  }

  modifier onlyBeneficiariesOrOwner() {
    require(msg.sender == owner || isBeneficiary(msg.sender));
    _;
  }

  modifier onlyBeneficiaries() {
    require(isBeneficiary(msg.sender));
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
