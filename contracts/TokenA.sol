// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract TokenA is ERC20PresetMinterPauser {
  uint INITIAL_SUPPLY = 100 ether;

  constructor() public ERC20PresetMinterPauser("Test Token A", "aTST") {
    _mint(msg.sender, INITIAL_SUPPLY);
  }
}
