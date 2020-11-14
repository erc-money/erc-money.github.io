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
  - *Mainnet* `iEMT` Token Contract: [0x0](https://rinkeby.etherscan.io/address/0x0)
  - *Rinkeby* `Marketplace` Contract: [0xa4307C6D0EA59eacc19e6cBa4208543b71F1Ecb0](https://rinkeby.etherscan.io/address/0xa4307C6D0EA59eacc19e6cBa4208543b71F1Ecb0)
  - *Rinkeby* `iEMT` Token Contract: [0xB975F722ae44500a30e6736871dc7C6263AAce78](https://rinkeby.etherscan.io/address/0xB975F722ae44500a30e6736871dc7C6263AAce78)
  - *Rinkeby* `aTST` Token Contract: [0x1DdFBD8c467CFd18d84004AA4D79B07B5e024A5d](https://rinkeby.etherscan.io/address/0x1DdFBD8c467CFd18d84004AA4D79B07B5e024A5d)
  - *Rinkeby* `bTST` Token Contract: [0xA969b9CFc438214Bf1BCF5D0aD4E8CEa901B6840](https://rinkeby.etherscan.io/address/0xA969b9CFc438214Bf1BCF5D0aD4E8CEa901B6840)

Analysis
------

  - [ConsenSys Solidity Metrics](/solidity-metrics.html)
  - [Coverage Report](/coverage/index.html)
