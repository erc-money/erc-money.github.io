// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOrder {
  enum Status { Open, PartiallyCompleted, Completed, Closed }

  struct Order {
    IERC20 from;
    uint fromAmount;
    IERC20 to;
    uint toAmount;

    // @dev owner address
    address owner;

    // @dev allow partial matching, e.g. allow closing 10% of the order
    bool allowPartial;

    // @dev orderId
    uint id;

    // @dev reentrancy guard
    bool transacting;

    // @order status
    Status status;

    // @dev amount that was already matched (related to fromAmount)
    uint completedAmount;
  }
}
