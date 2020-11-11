// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./IToken.sol";

interface IOrder {
  enum Status { Open, PartiallyCompleted, Completed, Closed }

  struct Order {
    IToken from;
    uint fromAmount;
    IToken to;
    uint toAmount;

    // @dev symbol of from token
    string fromSymbol;

    // @dev Decimals of from token
    uint fromDecimals;

    // @dev symbol of to token
    string toSymbol;

    // @dev Decimals of to token
    uint toDecimals;

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
