require('dotenv').config();
const WalletProvider = require('truffle-hdwallet-provider-privkey');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const PRIVATE_KEYS = process.env.PRIVATE_KEYS || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const NETWORK = process.env.NETWORK;
 
const provider = new WalletProvider(
    PRIVATE_KEYS.split(','),
    `https://${NETWORK}.infura.io/v3/${INFURA_API_KEY}`
);

web3 = new Web3(provider.engine);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);
    console.log('_____________________________________________________________________')

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000', gasPrice: '5000000000' });

    console.log('Creation result:', result);
    console.log('_____________________________________________________________________')
    console.log(`Contract deployed to ${NETWORK} at address: ${result.options.address}`);
    console.log('_____________________________________________________________________')
};
deploy();