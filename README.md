erc.money Dapp
===================

This repository contains erc.money Dapp and the contracts written in Solidity language.

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

Compile Dapp: `cd vapp && npm run build`

> Built into `./docs` served by [GH Pages](https://erc.money)

Deployments
----------

  - *Mainnet* `Marketplace` Contract address: [0x0](https://etherscan.io/address/0x0)
  - *Rinkeby* `Marketplace` Contract: [0x24C7D6E3E144d414eBa5c0B26aDc234833cae065](https://rinkeby.etherscan.io/address/0x24C7D6E3E144d414eBa5c0B26aDc234833cae065)
  - *Rinkeby* `aTST` Token Contract: [0x88A094759C5A395ea6Fc18F57fa540aDCd2Ef844](https://rinkeby.etherscan.io/address/0x88A094759C5A395ea6Fc18F57fa540aDCd2Ef844)
  - *Rinkeby* `bTST` Token Contract: [0x543e02f333fD4caC1522203883B91B6741b93469](https://rinkeby.etherscan.io/address/0x543e02f333fD4caC1522203883B91B6741b93469)

Analysis
------

  - [ConsenSys Solidity Metrics](/solidity-metrics.html)
  - [Coverage Report](/coverage/index.html)
