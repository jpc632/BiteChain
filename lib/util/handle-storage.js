const fs = require('fs');

const STORAGE_DIRECTORY = './data/blockchain.json';

const writeChainToFile = (chain) => {
    const data = JSON.stringify(chain, null, 4);

    fs.writeFile(STORAGE_DIRECTORY, data, 'utf8', (err) => {
        if(err)
            console.error(`Error writing file: ${err}`);
    });
}
//FIXME: async issue
const loadChainFromFile = (chain) => {
    fs.readFile(STORAGE_DIRECTORY, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file from disk: ${err}`);
        }else{
            if(!data){
                return;
            }
            chain = JSON.parse(data);
        }
    });
}

module.exports = { writeChainToFile, loadChainFromFile }