# smart-contract-lotter
Lottery smart contracts. Player must submit a minimum ammount of 0.02 ETH to enter into the lottery pool. After all players have entered, the manger address(account that deployed contract) can call the pickWinner() function. The winning will be picked using a pseudo random generator and the winning address with receive all ETH in the lottery pool. After the lottery winner is selected the smart contacts state will reset and a new lottery round can start.

# Contract deployed
- ropsten: 0x4b52F9356F1119c102b34316f720996681eb5731
- https://ropsten.etherscan.io/address/0x4b52F9356F1119c102b34316f720996681eb5731

# Test Contract locally
- npm run test

# Deploy Contract
1. Create .env file locally
2. Using the .ene.example fill in the required feilds
3. Use deploy script npm run deploy

Example of what a evn may look like
PRIVATE_KEYS="DRVE4335G55656555JJJFDDS3"
INFURA_API_KEY=JJJSFB55554BJG4
NETWORK=kovan


