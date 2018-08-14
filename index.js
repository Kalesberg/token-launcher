const fs = require('fs')
const solc = require('solc')
const Web3 = require('web3')
const Tx = require('ethereumjs-tx')
const BigNumber = require('bignumber.js')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const config = require('./config')
const web3 = new Web3(config.HTTP_PROVIDER)

let NONCE = 0;

createTransaction = async (params) => {
    if (!NONCE) {
        NONCE = await web3.eth.getTransactionCount(params.addressFrom)
    }
    else {
        NONCE += 1
    }

    let chainId = parseInt(config.CHAIN_ID)
    let gasPrice = await web3.eth.getGasPrice()

    let eth = params.eth || '0'

    let txParams = {
        nonce: web3.utils.toHex(NONCE),
        gasPrice: web3.utils.toHex(20000000000),
        gasLimit: web3.utils.toHex(4700000),
        value: web3.utils.toHex(web3.utils.toWei(eth, 'ether')),
        chainId: chainId,
        data: (params.data || '')
    };

    let tx = new Tx(txParams)
    let privateKey = new Buffer.from(params.key, 'hex')
    tx.sign(privateKey)
    let serializedTx = tx.serialize()

    return '0x' + serializedTx.toString('hex');
}

app.get('/', (req, res) => {
    res.send('Token Launcher works!')
})

app.post('/deploy', async (req, res) => {
    let connected = await web3.eth.net.isListening();
    if (!connected) {
        res.status(400).send('Server is not connected Ethereum blockchain.')
    }

    let source = fs.readFileSync("./contracts/erc20.sol", 'utf8');
    console.log('compiling contract...')
    let compiledContract = solc.compile(source).contracts[':ERC20Token']
    console.log('done')
    let bytecode = compiledContract.bytecode
    let abi = JSON.parse(compiledContract.interface)

    let gasPrice = await web3.eth.getGasPrice()
    let contract = new web3.eth.Contract(abi)
    // let erc20 = await contract.deploy({
    //     data: '0x' + bytecode,
    //     arguments: ['ERC20', 'Example ERC20 Token', 18, 1000000]
    // })
    // .send({
    //     from: config.OWNERADDRESS,
    //     gas: 4700000,
    //     gasPrice: gasPrice
    // })

    // res.send('Deployed at ' + erc20.options.address + ' in ' + config.HTTP_PROVIDER)

    const totalSupply = new BigNumber(req.body.totalsupply * (10 ** req.body.decimals))
    let deployCode = await contract.deploy({
        data: '0x' + bytecode,
        arguments: [req.body.tick, req.body.name, req.body.decimals, totalSupply]
    }).encodeABI()

    let params = {
        addressFrom: config.OWNERADDRESS,
        key: config.OWNERKEY,
        data: deployCode
    }
    const signedData = await createTransaction(params)
    web3.eth.sendSignedTransaction(signedData)
    .on('transactionHash', hash => {
        res.json({txHash: hash, error: null})
    })
    .on('error', err => {
        console.log('Error in transaction: ', err)
        res.status(500).send({txHash: null, error: err})
    })
})

app.listen(config.PORT, () => console.log('Token Launcher App - listening on port ' + config.PORT))