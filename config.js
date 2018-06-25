const CONFIG = {
    HTTP_PROVIDER: process.env.HTTP_PROVIDER || 'http://localhost:8545',
    OWNERADDRESS: process.env.OWNERADDRESS || '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
    OWNERKEY: process.env.OWNERKEY || 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    CHAIN_ID: process.env.CHAIN_ID || 1337
}

module.exports = CONFIG