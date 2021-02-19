const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')

const Web3 = require('web3')



const app = express();
const PORT = 3000;

app.use(bodyParser.json());

function GetContractById(chainId){
    var CONTRACT_ADDRESS = {
        NFT_FACTORY_ADDRESS : '0xf2EfcA47BD1C7A478F84156f4fb6745186c29A25',
        NFT_ADDRESS : '0x1c137Ba270fbcD22D3c7Bdac101f0A21cb0885cE',
        HTTP_NETWORK : 'https://http-mainnet-node.huobichain.com'
    }
    switch(chainId){
        case '56' :
            break;
        case '97' :
            CONTRACT_ADDRESS = {
                NFT_FACTORY_ADDRESS : '0x154dfB0a0e3E81f0659ACB2973b185735dF88b10',
                NFT_ADDRESS : '0xAA990C25732906b87B1fF3934a76505Fc0991608',
                HTTP_NETWORK : 'https://data-seed-prebsc-1-s1.binance.org:8545/'
            }
            break;
        case '128' : 
                CONTRACT_ADDRESS = {
                    NFT_FACTORY_ADDRESS : '0xf2EfcA47BD1C7A478F84156f4fb6745186c29A25',
                    NFT_ADDRESS : '0x1c137Ba270fbcD22D3c7Bdac101f0A21cb0885cE',
                    HTTP_NETWORK : 'https://http-mainnet-node.huobichain.com'
                }
            break;
        case '256' : 
            break;
    }

    return CONTRACT_ADDRESS;
}


app.get('/null-card/:id/:chainId', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");

    var cardAvaiables = JSON.parse(fs.readFileSync('null-cards.json'));
    var collections = JSON.parse(fs.readFileSync('collection.json'));
    var result = cardAvaiables.find(x => x.id == req.params.id);

    if (result == "" || result == null || result == undefined) {
        var CONTRACT_ADDRESS = GetContractById(req.params.chainId);

        var web3 = new Web3(CONTRACT_ADDRESS.HTTP_NETWORK);
        var nft_abi = JSON.parse(fs.readFileSync(`nft.json`));
        var nft_factory_abi = JSON.parse(fs.readFileSync(`nft-factory.json`));
        var contract = new web3.eth.Contract(nft_abi, CONTRACT_ADDRESS.NFT_ADDRESS);
        var contract_factory = new web3.eth.Contract(nft_factory_abi, CONTRACT_ADDRESS.NFT_FACTORY_ADDRESS);
        let lst = [];
        let cardId  = req.params.id;
        if (cardAvaiables.find(abi => abi.id == cardId) == undefined) {
            contract_factory.methods.cardIndex(cardId).call()
                .then((cardIndex) => {

                    var cardInfo = collections.find(collection =>
                        collection.types == cardIndex.types
                        && collection.rank == cardIndex.rank);
     
                    contract.methods.ownerOf(cardId).call()
                    .then((owner)=>{
                        var obj = {
                            id : cardId,
                            token_id : owner+ '.' + cardId,
                            name : cardInfo.name,
                            description : cardInfo.description,
                            token_image : cardInfo.token_image,
                            external_url : 'https://img.neumekca.city/null/'+ cardId,
                            types : cardInfo.types,
                            rank : cardInfo.rank,
                            rank_text : cardInfo.rank_text,
                            skills : cardIndex.skills,
                            effect : cardInfo.effect.split('random')[0] + cardIndex.skills,
                            created_time : cardId,
                            author : owner,
                            block : ''
                        }
                        cardAvaiables.push(obj);
                        let data = JSON.stringify(cardAvaiables);
                        fs.writeFileSync('null-cards.json', data);
                    })
                })
        }
    }
    result = cardAvaiables.find(x => x.id == req.params.id);
    res.send(result);
});

app.get('/hecochain', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");

    var s = JSON.parse(fs.readFileSync('token-list.json'));
    res.send(s);
});

app.get('/collection', function(req,res){
    res.header("Access-Control-Allow-Origin", "*");

    var s = JSON.parse(fs.readFileSync('collection.json'));

    res.send(s);
});


app.listen(PORT, () =>console.log(`Server running on port: http://localhost:${PORT}`));
