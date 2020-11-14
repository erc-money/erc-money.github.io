// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./IOrder.sol";
import "./IToken.sol";

contract Marketplace is Ownable, Pausable {
  using SafeMath for uint;
  using SafeERC20 for IToken;

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

  // @dev treasury wallet to forward donated eth to
  address payable public treasury;

  // @dev reward token
  IToken public token;

  // @dev amount tokens to reward for a closed order
  uint public reward;

  // @dev amount of distributed rewards
  uint public rewardsCount;

  // @dev value of distributed rewarrds
  uint public rewardsValue;

  // @dev order if incrementer
  uint public lastOrderId;

  // @dev orders book
  mapping (uint => IOrder.Order) orders;

  // @dev active orders of an user
  mapping (address => uint[]) userActiveOrders;

  // @dev orders status
  mapping (IOrder.Status => uint) ordersStats;

  // @dev blacklisted tokens count
  uint public blacklistedTokensCount;

  // @dev token addresses that are blacklisted
  mapping (IToken => bool) blacklistedTokens;

  /**
   * @dev Emitted when the donation of `value` received from `account`.
   */
  event Donated(address account, uint value);

  /**
   * @dev Emitted when a `token` gets blacklisted by `who`.
   */
  event BlacklistedToken(IToken token, address who);

  /**
   * @dev Emitted when a `token` gets un-blacklisted by `who`.
   */
  event UnblacklistedToken(IToken token, address who);

  /**
   * @dev Emitted when reward `token` and a `reward` amount apecified by `who`.
   */
  event RewardUpdated(IToken token, uint reward, address who);

  /**
   * @dev Emitted when `receiver` rewarded with `reward` amount of tokens.
   */
  event Reward(address receiver, uint reward);

  /**
   * @dev Order updated
   */
  event OrderCreated(uint orderId, string fromSymbol, string toSymbol);

  /**
   * @dev Order updated
   */
  event OrderUpdated(uint orderId, IOrder.Status fromStatus, IOrder.Status toStatus);

  /**
   * @dev check if `token` is not blacklisted
   */
  modifier isNotBlacklisted(IToken _token) {
    require(
      isTokenBlacklisted(_token) == false,
      "Token is blacklisted."
    );
    _;
  }

  modifier orderReentrancyGuard(uint orderId) {
    require(
      orders[orderId].transacting == false,
      "Reentrancy is not allowed."
    );
    orders[orderId].transacting = true;
    _;
    orders[orderId].transacting = false;
  }

  modifier orderOpen(uint orderId) {
    require(
      orders[orderId].id > 0,
      "Order does not exist."
    );
    require(
      orders[orderId].status != IOrder.Status.Completed
        && orders[orderId].status != IOrder.Status.Closed,
      "Order is either completed or closed."
    );
    _;
  }

  constructor(
    address _owner,
    address payable _treasury
  ) public {
    require(_treasury != address(0), "Invalid treasury wallet address");
    require(_owner != address(0), "Invalid owner address");

    treasury = _treasury;
    transferOwnership(_owner);
  }

  function orderExists(uint orderId) public view returns (bool) {
    return orders[orderId].id > 0;
  }

  function getOrder(uint orderId) public view returns (IOrder.Order memory order) {
    order = orders[orderId];
  }

  function isOrderActive(uint orderId) public view returns (bool) {
    IOrder.Status status = orders[orderId].status;

    return orderExists(orderId)
      && status != IOrder.Status.Completed
      && status != IOrder.Status.Closed;
  }

  function isTokenBlacklisted(IToken _token) public view returns (bool) {
    return blacklistedTokens[_token];
  }

  function stats(IOrder.Status status) public view returns (uint) {
    return ordersStats[status];
  }

  function listActiveUserOrders(address user) public view
  returns (IOrder.Order[] memory userOrders){
    uint count = userActiveOrders[user].length;
    userOrders = new IOrder.Order[](count);

    for (uint i = 0; i < count; i++) {
      uint orderId = userActiveOrders[user][i]; 
      userOrders[i] = orders[orderId];
    }
  }

  function listOrders(uint offset, uint size, bool listOnlyActive, string memory matchSymbol) public view
  returns (IOrder.Order[] memory page, uint newOffset, uint entries) {
    require(size <= 100, "Max page size is 100");
    page = new IOrder.Order[](size);

    for (uint i = 0; i < size; i++) {
      uint y = offset + i;

      if (y >= lastOrderId) {
        break;
      }

      uint orderId = lastOrderId - y;

      if ((!listOnlyActive || isOrderActive(orderId))
        && _matchOrderTokens(orders[orderId], matchSymbol)) {
        entries++;
        newOffset = orderId + 1;
        page[i] = orders[orderId];
      }
    }
  }

  function orderPayoffAmount(uint orderId, uint amount) public view returns (uint payoffAmount) {
    IOrder.Order storage order = orders[orderId];
    require(
      amount > 0 && amount <= (order.fromAmount - order.completedAmount),
      "Amount is either 0 or greater than the one available"
    );
    require(order.allowPartial || amount == order.fromAmount, "Order does not allow partial buyout");

    payoffAmount = amount * order.toAmount / order.fromAmount;
  }

  function createOrder(
    IToken from,
    uint fromAmount,
    IToken to,
    uint toAmount,
    bool allowPartial
  ) public
  whenNotPaused isNotBlacklisted(from) isNotBlacklisted(to)
  returns (uint orderId) {
    require(fromAmount > 0 && toAmount > 0, "Amounts can not be 0");
    require(address(from) != address(to), "Token can not be the same");
    require(Address.isContract(address(from)), "Token 'from' should be a contract");
    require(Address.isContract(address(to)), "Token 'to' should be a contract");

    string memory fromSymbol = from.symbol();
    uint fromDecimals = from.decimals();
    string memory toSymbol = to.symbol();
    uint toDecimals = from.decimals();

    require(bytes(fromSymbol).length > 0 && fromDecimals > 0, "Token 'from' is not a valid ERC20 token");
    require(bytes(toSymbol).length > 0 && toDecimals> 0, "Token 'to' is not a valid ERC20 token");
    require(
      from.allowance(_msgSender(), address(this)) >= fromAmount,
      "Marketplace not allowed to spend desired amount of tokens"
    );

    orderId = ++lastOrderId;
    orders[orderId] = IOrder.Order(
      from,
      fromAmount,
      to,
      toAmount,
      fromSymbol,
      fromDecimals,
      toSymbol,
      toDecimals,
      _msgSender(),
      allowPartial,
      orderId, // id
      false, // transacting
      IOrder.Status.Open, // status
      0 // completedAmount
    );
    ordersStats[IOrder.Status.Open]++;
    userActiveOrders[_msgSender()].push(orderId);

    emit OrderCreated(orderId, fromSymbol, toSymbol);
  }

  function closeOrder(uint orderId) public
  orderReentrancyGuard(orderId) orderOpen(orderId)
  returns (bool) {
    require(orders[orderId].owner == _msgSender(), "Order updates allowed by orners only!");

    _updateOrder(orders[orderId], IOrder.Status.Closed);
  }

  function claimOrder(uint orderId, uint amount, address wallet) public
  whenNotPaused orderReentrancyGuard(orderId) orderOpen(orderId)
  returns (bool) {
    IOrder.Order storage order = orders[orderId];

    require(wallet != order.owner, "You can not buyback from yourself");
    require(_msgSender() != order.owner, "You can not trigger buyback from yourself");

    uint payoffAmount = orderPayoffAmount(orderId, amount);
    
    require(
      order.to.allowance(_msgSender(), address(this)) >= payoffAmount,
      "Marketplace not allowed to spend desired amount of tokens"
    );

    order.completedAmount += amount;
    IOrder.Status newStatus = order.completedAmount == order.fromAmount
      ? IOrder.Status.Completed
      : IOrder.Status.PartiallyCompleted;
    
    _updateOrder(order, newStatus);

    order.to.safeTransferFrom(_msgSender(), order.owner, payoffAmount);
    order.from.safeTransferFrom(order.owner, wallet, amount);
    
    // send rewards
    if (newStatus == IOrder.Status.Completed) {
      _reward(order.owner);
    }
    _reward(_msgSender());

    return true;
  }

  /**
   * @dev Update closed order reward
   */
  function updateReward(IToken _token, uint _reward) public onlyOwner {
    require(address(_token) != address(0), "Invalid token address");
    require(_token.hasRole(MINTER_ROLE, address(this)), "Marketplace is not a minter");

    token = _token;
    reward = _reward;

    emit RewardUpdated(_token, _reward, _msgSender());
  }

  /**
   * @dev Blacklist a token
   */
  function blacklistToken(IToken _token, bool state) public onlyOwner {
    blacklistedTokens[_token] = state;

    if (state) {
      blacklistedTokensCount++;
      emit BlacklistedToken(_token, _msgSender());
    } else {
      blacklistedTokensCount--;
      emit UnblacklistedToken(_token, _msgSender());
    }
  }

  function freeze(bool state) public onlyOwner {
    if (state) {
      _pause();
    } else {
      _unpause();
    }
  }

  function _matchOrderTokens(IOrder.Order memory order, string memory symbol) internal view returns (bool) {
    return _matchString(order.fromSymbol, symbol) || _matchString(order.toSymbol, symbol);
  }

  function _matchString(string memory where, string memory what) internal view returns (bool found) {
    bytes memory whereBytes = bytes(where);

    if (whereBytes.length == 0) {
      return true;
    }

    bytes memory whatBytes = bytes(what);

    for (uint i = 0; i < whereBytes.length - whatBytes.length; i++) {
      bool flag = true;

      for (uint j = 0; j < whatBytes.length; j++) {
        if (_upperCaseByte(whereBytes[i + j]) != _upperCaseByte(whatBytes[j])) {
          flag = false;
          break;
        }
      }

      if (flag) {
        found = true;
        break;
      }
    }
  }

  function _upperCaseByte(bytes1 _b1) internal view returns (bytes1) {
    if (_b1 >= 0x61 && _b1 <= 0x7A) {
      return bytes1(uint8(_b1) - 32);
    }

    return _b1;
  }

  function _updateOrder(IOrder.Order storage order, IOrder.Status toStatus) internal {
    IOrder.Status fromStatus = order.status;

    order.status = toStatus;
    ordersStats[fromStatus]--;
    ordersStats[toStatus]++;

    if (toStatus == IOrder.Status.Completed || toStatus == IOrder.Status.Closed) {
      (,bool found) = _removeActiveOrder(order.owner, order.id);
      require(found, "Order is not found as active. Should never happen!");
    }

    emit OrderUpdated(order.id, fromStatus, toStatus);
  }

  /**
   * Removes an order from active user orders
   */
  function _removeActiveOrder(address user, uint orderId) internal returns (uint index, bool found) {
    for (uint i = 0; i < userActiveOrders[user].length; i++){
      if (userActiveOrders[user][i] == orderId) {
        found = true;
        index = i;
        break;
      }
    }

    if (!found) {
      return (index, found);
    }

    for (uint i = index; i < userActiveOrders[user].length - 1; i++){
      userActiveOrders[user][i] = userActiveOrders[user][i + 1];
    }

    userActiveOrders[user].pop();
  }

  /**
   * @dev transfer reward for a closed order
   */
  function _reward(address receiver) internal {
    if (reward > 0) {
      token.mint(receiver, reward);
      rewardsCount++;
      rewardsValue += reward;
      emit Reward(receiver, reward);
    }
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
