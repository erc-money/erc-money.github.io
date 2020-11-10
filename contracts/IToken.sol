// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IToken is IERC20 {
  function mint(address to, uint256 amount) external;
  function hasRole(bytes32 role, address account) external returns (bool);
}
