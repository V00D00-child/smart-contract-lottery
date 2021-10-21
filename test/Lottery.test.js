const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');
const EVM_REVERT = 'VM Exception while processing transaction: revert';

let lotteryContract;
let deployerAccount;
let playerOneAccount;
let playerTwoAccount;
let playerThreeAccount;

beforeEach(async () => {
    // Load accounts
    const accounts = await web3.eth.getAccounts();
    deployerAccount = accounts[0];
    playerOneAccount = accounts[1];
    playerTwoAccount = accounts[2];
    playerThreeAccount = accounts[3];

    lotteryContract = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: deployerAccount, gas: '1000000' });
});

describe('Lottery smart contract', () => {
    it('Deploys a contract', () => {
        assert.ok(lotteryContract.options.address);
    });

    it('Should set the manager of the contact as the account that deployed the contract', async () => {
        const manger = await lotteryContract.methods.manager().call();
        assert.equal(manger, deployerAccount);
    });

    it('Should allow one account to enter to into lottery', async () => {
        await lotteryContract.methods.enter().send({
            from: playerOneAccount,
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lotteryContract.methods.getPlayers().call({
            from: deployerAccount
        });

        assert.equal(playerOneAccount, players[0]);
        assert.equal(1, players.length);
    });

    it('Should emit Enter event when account enter to into lottery', async () => {
        const enterResult = await lotteryContract.methods.enter().send({
            from: playerOneAccount,
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lotteryContract.methods.getPlayers().call({
            from: deployerAccount
        });

        assert.equal(playerOneAccount, players[0]);
        assert.equal(1, players.length);

        // event emitted
        assert.equal('Enter', enterResult.events.Enter.event);
        assert.equal(1, enterResult.events.Enter.returnValues.players.length);

    });

    it('Should not allow manage account to enter to into lottery', async () => {
        try {
            await lotteryContract.methods.enter().send({
                from: deployerAccount,
                value: web3.utils.toWei('0.02', 'ether')
            });
        } catch (err) {
            assert(err);
            assert.equal(EVM_REVERT, err.message);

            const players = await lotteryContract.methods.getPlayers().call({
                from: deployerAccount
            });
    
            assert.equal(0, players.length);
        }
    });

    it('Should allow multiple accounts to enter into lottery', async () => {
        await lotteryContract.methods.enter().send({
            from: playerOneAccount,
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lotteryContract.methods.enter().send({
            from: playerTwoAccount,
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lotteryContract.methods.enter().send({
            from: playerThreeAccount,
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lotteryContract.methods.getPlayers().call({
            from: deployerAccount
        });

        assert.equal(playerOneAccount, players[0]);
        assert.equal(playerTwoAccount, players[1]);
        assert.equal(playerThreeAccount, players[2]);
        assert.equal(3, players.length);
    });

    it('Should not allow same account to enter more than once', async () => {
        await lotteryContract.methods.enter().send({
            from: playerOneAccount,
            value: web3.utils.toWei('0.02', 'ether')
        });

        try {
            await lotteryContract.methods.enter().send({
                from: playerOneAccount,
                value: web3.utils.toWei('0.02', 'ether')
            });
        } catch (err) {
            assert(err);
            assert.equal(EVM_REVERT, err.message);

            const players = await lotteryContract.methods.getPlayers().call({
                from: deployerAccount
            });
    
            assert.equal(playerOneAccount, players[0]);
            assert.equal(1, players.length);
        }
    });

    it('Should require a minimum amount of ether to enter', async () => {
        try {
            await lotteryContract.methods.enter().send({
                from: playerOneAccount,
                value: 0
            });
        } catch (err) {
            assert(err);
            assert.equal(EVM_REVERT, err.message);
        }
    });

    it('Should restrict calling pickWinner() to only manager account', async () => {
        try {
            await lotteryContract.methods.pickWinner().send({
                from: playerOneAccount
            });
        } catch (err) {
            assert(err);
            assert.equal(EVM_REVERT, err.message);
        }
    });

    it('Should send money to winner account and rest the players array', async () => {
        await lotteryContract.methods.enter().send({
            from: playerOneAccount,
            value: web3.utils.toWei('2', 'ether')
        });

        const initalBalance = await web3.eth.getBalance(playerOneAccount);
        await lotteryContract.methods.pickWinner().send({ from: deployerAccount });
        const finalBalance = await web3.eth.getBalance(playerOneAccount);
        const difference = finalBalance - initalBalance;

        assert(difference > web3.utils.toWei('1.8', 'ether'));

        // Reset contact state 
        const players = await lotteryContract.methods.getPlayers().call({
            from: deployerAccount
        });
        assert.equal(0, players.length);

        const loteryContractBalance = await web3.eth.getBalance(lotteryContract.options.address);
        const winner = await lotteryContract.methods.lastWinner().call();

        assert.equal(0, loteryContractBalance);
        assert.equal(playerOneAccount, winner)
    });
});