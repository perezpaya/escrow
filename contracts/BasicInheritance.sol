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
  uint public depositedAmount;
  uint public lastOwnerNotice;
  uint public timeUntilUnlock;

  function () payable {
    processDeposit();
  }

  function processDeposit() internal {
    depositedAmount += msg.value;
    Deposit(msg.value, msg.sender);
  }

  function addBeneficiary(address beneficiary) onlyOwner {
    beneficiaries.push(beneficiary);
    NewBeneficiary(beneficiary);
  }

  function getBeneficiaries() public returns (address[]) {
    return beneficiaries;
  }

  function getAvailableBalance() onlyBeneficiariesOrOwner public returns (uint) {
    return this.balance / beneficiaries.length;
  }

  function cashOut() onlyIfUnlocked onlyBeneficiaries {
    availableBalance = getAvailableBalance();
    depositedAmount -= availableBalance;
    removeFromBeneficiaries(msg.sender);
    msg.sender.transfer(availableBalance);
    BeneficiaryCashedOut(msg.value, msg.sender);
  }

  function removeFromBeneficiaries(address beneficiary) internal {
    beneficiaries.removeByValue(beneficiary);
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
    require(block.timestamp > timeUntilUnlock + lastOwnerNotice);
    _;
  }

  event Deposit(uint value, address fiduciary);
  event NewBeneficiary(address beneficiary);
  event BeneficiaryCashedOut(uint value, address beneficiary);
}
