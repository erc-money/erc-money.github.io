// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract EMToken is ERC20PresetMinterPauser {
  constructor() public ERC20PresetMinterPauser("erc.money Token", "iEMT") {}
}
