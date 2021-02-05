const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')


const NFT_FACTORY_ADDRESS = '0xE10a109218D0e7c258A49f69BC7337193f28e815';
const NFT_ADDRESS = '0x1c137Ba270fbcD22D3c7Bdac101f0A21cb0885cE';
const HTTP_NETWORK = 'https://http-mainnet-node.huobichain.com';

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.get('/collection', function(req,res){
    var s = JSON.parse(fs.readFileSync('collection.json'));

    res.send(s);
});
app.get('/null-card/:id', function(req,res){
    var cardAvaiables = JSON.parse(fs.readFileSync('null-cards.json'));
    var collections = JSON.parse(fs.readFileSync('collection.json'));
    var result = cardAvaiables.find(x => x.id == req.params.id);
    if (result == "" || result == null || result == undefined) {
        var web3 = new Web3(HTTP_NETWORK);
        var nft_abi = JSON.parse(fs.readFileSync(`nft.json`));
        var nft_factory_abi = JSON.parse(fs.readFileSync(`nft-factory.json`));
        var contract = new web3.eth.Contract(nft_abi, NFT_ADDRESS);
        var contract_factory = new web3.eth.Contract(nft_factory_abi, NFT_FACTORY_ADDRESS);
        let lst = [];
        contract.methods.totalSupply().call().then((x) => {
            if (cardAvaiables.length != x) {
                for (let i = 0; i < x; i++) {
                    contract.methods.tokenByIndex([i]).call()
                        .then((cardId) => {
                            if (cardAvaiables.find(abi => abi.id == cardId) == undefined) {
                                contract_factory.methods.cardIndex(Number(cardId)).call()
                                    .then((cardIndex) => {

                                        var cardInfo = collections.find(collection =>
                                            collection.types == cardIndex.types
                                            && collection.rank == cardIndex.rank);
                                   
                                        contract.methods.ownerOf(Number(cardId)).call()
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
                                            if(cardAvaiables.length == x){
                                                let data = JSON.stringify(cardAvaiables);
                                                console.log(cardAvaiables);
                                                fs.writeFileSync('null-cards.json', data);
                                            }
                                        })

                                       

                                       
                                    })


                            }
                        });
                }
              
            }
        })
    }
    res.send(result);
});

app.get('/hecochain', function(req,res){
    var s = JSON.parse(fs.readFileSync('token-list.json'));
    res.send(s);
});








app.listen(PORT, () =>console.log(`Server running on port: http://localhost:${PORT}`));
