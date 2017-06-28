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

  /** Removes the given value in an array. */
  function removeByValue(address[] a, address e) {
    int index = indexOf(a, e);
    if (index == -1) throw;
    removeByIndex(a, uint(index));
  }

  /** Removes the value at the given index in an array. */
  function removeByIndex(address[] a, uint i) {
    while (i<a.length-1) {
      a[i] = a[i+1];
      i++;
    }
    delete a[a.length-1];
  }
}
