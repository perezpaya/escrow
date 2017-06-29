pragma solidity ^0.4.11;

library ArrayUtils {
  function indexOf(address[] self, address e) returns (uint) {
    for (uint i = 0; i < self.length; i++)
      if (self[i] == e) return i;
    return uint(-1);
  }

  function includes(address[] a, address e) returns (bool) {
    return indexOf(a, e) != uint(-1);
  }

  /** Removes the given value in an array. */
  function removeByValue(address[] storage a, address e) {
    uint index = indexOf(a, e);
    if (index == uint(-1)) throw;
    removeAt(a, index);
  }

  /** Removes the value at the given index in an array. */
  function removeAt(address[] storage a, uint index) {
    if (a.length > 1) a[index] = a[a.length - 1];
    a.length--;
  }
}
