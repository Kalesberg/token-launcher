const CONFIG = {
    HTTP_PROVIDER: process.env.HTTP_PROVIDER || 'https://ropsten.infura.io/nAp458BQNRGwQ3Fynkd5',
    OWNERADDRESS: process.env.OWNERADDRESS || '0x773679a768aca758c2e4e65afa0bb94d1037ed82',
    OWNERKEY: process.env.OWNERKEY || '1C895CF11B3D4DA06B9EBC9FC056F50FAEDB69045296009F2B19C16CDCD8C779',
    CHAIN_ID: process.env.CHAIN_ID || 3
}

module.exports = CONFIG