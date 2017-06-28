pragma solidity ^0.4.11;

import "zeppelin/ownership/Ownable.sol";
import "./ArrayUtils.sol";

contract BasicInheritance is Ownable {
  using ArrayUtils for address[];

  string public description;

  function BasicInheritance(string _description) {
    description = _description;
  }

  address[] beneficiaries;
  uint public depositedAmount;

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

  modifier onlyBeneficiariesOrOwner() {
    require(msg.sender == owner || beneficiaries.includes(msg.sender));
    _;
  }

  modifier onlyBeneficiaries() {
    require(beneficiaries.includes(msg.sender));
    _;
  }

  event Deposit(uint value, address fiduciary);
  event NewBeneficiary(address beneficiary);
}
