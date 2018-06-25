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

sendTransaction = async (params) => {
    let chainId = parseInt(config.CHAIN_ID)
    let nonce = await web3.eth.getTransactionCount(params.addressFrom)
    let gasPrice = await web3.eth.getGasPrice()

    let eth = params.eth || '0'

    let txParams = {
        nonce: web3.utils.toHex(nonce),
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(4700000),
        from: params.addressFrom,
        to: params.addressTo,
        value: web3.utils.toHex(web3.utils.toWei(eth, 'ether')),
        chainId: chainId,
        data: (params.data || '')
    };

    console.log(txParams)
    let tx = new Tx(txParams)
    let privateKey = new Buffer.from(params.key, 'hex')
    tx.sign(privateKey)
    let serializedTx = tx.serialize()

    return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
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

    let deployCode = await contract.deploy({
        data: '0x' + bytecode,
        arguments: ['ERC20', 'Example ERC20 Token', 18, 1000000]
    }).encodeABI()

    let params = {
        addressFrom: config.OWNERADDRESS,
        key: config.OWNERKEY,
        addressTo: '0x0',
        data: deployCode
    }
    let txHash = await sendTransaction(params)
    res.json(txHash)
})

app.listen(3000, () => console.log('Token Launcher App - listening on port 3000'))