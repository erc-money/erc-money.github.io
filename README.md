Erc.Money Dapp
===================

[Erc.money](https://erc.money/) is an **unregulated** and **feeless** p2p **marketplace** 
for ERC20 tokens with no liquidity involved.

Checkout these
**[Reddit Thread](https://www.reddit.com/r/ethtrader/comments/jx35wn/unregulated_and_feeless_erc20_p2p_marketplace/)**
and
**[CryptoCompare Post](https://www.cryptocompare.com/coins/eth/post/p_1622821)**
...

Prerequisites
--------

  - [ ] Truffle v5.1.49
  - [ ] Node v10.x.x *(Limitation due to `scrypt` deprecated module)*
  - [ ] [Ganache](https://www.trufflesuite.com/ganache)

Usage
----

Install Truffle: `npm i -g truffle@5.1.49`

Install dependencies: `npm install`

Deploy contracts:
  - Deploy to Rinkeby: `INFURA_API_KEY=... PRIVATE_KEY=... npm run deploy:testnet`
  - Deploy to Mainnet: `INFURA_API_KEY=... PRIVATE_KEY=... npm run deploy`
  - Development (`Ganache`): `npm run deploy:develop -- --reset`

> Please start `Ganache` on port `8888` using Network ID `5777` on `All Interfaces (0.0.0.0)`<br/>
> (RPC Url: `http://0.0.0.0:8888`).

>  If you run WSL and your port are not forwarded, 
>   run `Powershell.exe -executionpolicy bypass -File ./fix-wsl-network.ps1` in Powershell.

> Also you can create alias for host IP in `~/.bashrc`:<br/>
>  `export WSL_HOST_IP=$(ipconfig.exe | awk '/WSL/ {getline; getline; getline; getline; print substr($14, 1, length($14)-1)}')`

Verify contracts on Etherscan:
  - Verify on Rinkeby: `ETHERSCAN_API_KEY=... npm run verify:testnet`
  - Verify on Mainnet: `ETHERSCAN_API_KEY=... npm run verify`

Run Tests: `npm run test`

Generate Coverage Report: `npm run coverage`

Run Dapp:

```bash
# Assuming your Ganache is running...
npm run deploy:develop
cd vapp
npm run serve
```

> Don't forget to add the project to your [`Ganache` settings](https://www.trufflesuite.com/docs/ganache/reference/ganache-settings#ganache-settings)

Build Dapp: `./build.sh`

> Built into `./docs` served by [GH Pages](https://erc.money)

Deployments
----------

  - *Mainnet* `Marketplace` Contract address: [N/A](https://etherscan.io/address/0x0)
  - *Mainnet* `iEMT` Token Contract: [N/A](https://rinkeby.etherscan.io/address/0x0)
  - *Rinkeby* `Marketplace` Contract: [0x3D4511289d3EEa63a175E9481EFA18817274B8b9](https://rinkeby.etherscan.io/address/0x3D4511289d3EEa63a175E9481EFA18817274B8b9)
  - *Rinkeby* `iEMT` Token Contract: [0x6B868a923246141D2Dc8E2828ea5221Ec829a073](https://rinkeby.etherscan.io/address/0x6B868a923246141D2Dc8E2828ea5221Ec829a073)

Analysis
------

  - [ConsenSys Solidity Metrics](https://erc.money/docs/solidity-metrics.html)
  - [Coverage Report](https://erc.money/docs/coverage/index.html)

Coverage
------

```
------------------|----------|----------|----------|----------|----------------|
File              |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------|----------|----------|----------|----------|----------------|
 contracts/       |    96.64 |    74.32 |      100 |    96.32 |                |
  EMToken.sol     |      100 |      100 |      100 |      100 |                |
  IOrder.sol      |      100 |      100 |      100 |      100 |                |
  IToken.sol      |      100 |      100 |      100 |      100 |                |
  Marketplace.sol |    96.64 |    74.32 |      100 |    96.32 |... 379,410,414 |
------------------|----------|----------|----------|----------|----------------|
All files         |    96.64 |    74.32 |      100 |    96.32 |                |
------------------|----------|----------|----------|----------|----------------|
```
