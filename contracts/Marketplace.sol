// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Marketplace is Ownable, Pausable {
  using SafeMath for uint;

  // @dev treasury wallet to forward donated eth to
  address payable public treasury;

  /**
   * @dev Emitted when the donation of `value` received from `account`.
   */
  event Donated(address account, uint value);

  constructor(
    address _owner,
    address payable _treasury
  ) public {
    require(_treasury != address(0), "Invalid treasury wallet address");
    require(_owner != address(0), "Invalid owner address");

    treasury = _treasury;
    transferOwnership(_owner);
  }

  /**
   * @dev This function is called for all messages sent to
   * this contract, except plain Ether transfers
   * (there is no other function except the receive function).
   * Any call with non-empty calldata to this contract will execute
   * the fallback function (even if Ether is sent along with the call).
   */
  fallback() external payable {
    treasury.transfer(msg.value);
    emit Donated(_msgSender(), msg.value);
  }

  /**
   * @dev This function is called for plain Ether transfers, i.e.
   * for every call with empty calldata.
   */
  receive() external payable {
    treasury.transfer(msg.value);
    emit Donated(_msgSender(), msg.value);
  }
}
