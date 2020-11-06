// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract TokenB is ERC20PresetMinterPauser {
  uint INITIAL_SUPPLY = 100 ether;

  constructor() public ERC20PresetMinterPauser("Test Token B", "bTST") {
    _mint(msg.sender, INITIAL_SUPPLY);
  }
}
