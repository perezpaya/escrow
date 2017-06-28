pragma solidity ^0.4.11;

library ArrayUtils {
  function indexOf(address[] a, address e) returns (int) {
    int index = -1;
    for(uint i = 0; i <= a.length; i++) {
      if (a[i] == e) { index = int(i); }
    }
    return index;
  }

  function includes(address[] a, address e) returns (bool) {
    return indexOf(a, e) != -1;
  }
}
