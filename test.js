const Blockchain = require("./lib/blockchain");
const fs = require('fs');
const { isBuffer } = require("util");

const blockchain =  new Blockchain();

//blockchain.addBlock({data: 'test'});


// ************** WRITE FILE *****************
// convert JSON object to a string
// const data = JSON.stringify(blockchain.chain, null, 4);

// // write file to disk
// fs.writeFile('./data/blockchain.json', data, 'utf8', (err) => {

//     if (err) {
//         console.log(`Error writing file: ${err}`);
//     } else 
//         console.log(`File is written successfully!`);
//     }

// });
//**************************************** */

// ********* READ FILE **********************clear

fs.readFile('./data/blockchain.json', 'utf8', (err, data) => {

    if (err) {
        console.log(`Error reading file from disk: ${err}`);
    } else {

        // parse JSON string to JSON object
        if(!data)
            return;
        blockchain.chain = JSON.parse(data);

        console.log(JSON.stringify(blockchain, null, 4));
    }

});