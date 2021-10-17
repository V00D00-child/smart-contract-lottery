const path = require('path');
const fs = require('fs');
const solc = require('solc');

const CONTRACT_NAME = 'Lottery';

// Go to current working dir and find contract
const lotteryPath = path.resolve(__dirname, 'contracts', `${CONTRACT_NAME}.sol`);

// Read raw source code
const source = fs.readFileSync(lotteryPath, 'utf8');

// Compile source code
module.exports = solc.compile(source, 1).contracts[`:${CONTRACT_NAME}`];