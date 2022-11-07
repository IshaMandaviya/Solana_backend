import { NFTS } from "../model/nfts.js";
import { Collection } from "../model/collection.js";
import { User } from "../model/users.js";
import { MarketPlex } from "../model/marketPlace.js"

export const listNFT = async (req, res) => {

    const { owner, mintKey, priceAmount } = req.body

    console.log(req.body);
    try {
        let Nft = await NFTS.findOne({
            mintKey
        })
        if(!Nft){
            
            const newNft = new NFTS({
                mintKey : mintKey,
                owner : owner,
                inSale : false,
                collectionName : "Unverified Nfts",
            })
            await newNft.save();
            Nft = newNft;
            
            const unverifiedCollection = await Collection.findOne({
                name: "Unverified Nfts"
            })
         
            unverifiedCollection.nfts.push(mintKey)
            unverifiedCollection.owners.push(owner)
             await unverifiedCollection.save();
        }

        const nftCollection = Nft.collectionName

        const collection = await Collection.findOne({
            name: nftCollection
        })

        if (Nft && collection) {
            try {

                Nft.inSale = true;
                Nft.priceAmount = priceAmount;
                Nft.owner = owner;
                Nft.save();
                if (collection.floorPrice == 0) {
                    collection.floorPrice = priceAmount;

                }
                if (priceAmount < collection.floorPrice) {
                    collection.floorPrice = priceAmount;
                }
                collection.totalListedNfts = collection.totalListedNfts + 1;

                const activity = {
                    mintKey: mintKey,
                    type: 'listed',
                    seller: owner,
                    priceAmount: priceAmount,
                }

                await collection.activity.push(activity);
                await collection.save();


                let user = await User.findOne({ publicKey: owner })

                if(!user){
                    user = new User({
                        publicKey:owner,
                        signature: "",
                        isSigned: true
                    });
                }

                user.activity.push(activity);
                await user.save();

                return res.status(201).json({ message: "Nft is listed ", data: collection })
            } catch (error) {
                return res.status(400).json({ message: error.message })
            }

        }
        else {
            return res.status(404).json({
                success: false,
                message: "NFT is not part of any collection or collection does not exits"
            })
        }
    }
    catch (error) {
        return res.status(409).json({ error: error.message })
    }
}



export const getNFTDetails = async (req, res) => {
    try {

        const mintKey = req.params.mint;
        const nft = await NFTS.findOne({
            mintKey
        })
        if (nft) {
            return res.status(201).json({
                success: true,
                data: nft,
                message: "nft Details fetched"
            })
        } else return res.status(404).json({
            success: false,
            message: "nft not found."
        })
    } catch (error) {
        return res.status(409).json({ error: error.message })
    }
}

export const listedNFTS = async (req, res) => {
    try {
        const { owner } = req.body
        if (owner) {
            const nft = await NFTS.find({
                owner, inSale: true
            })
            if (nft) {

                return res.status(200).json({
                    status: 1,
                    data: nft,
                    message: "This NFT is Listed"
                })


            }
            else {
                return res.status(200).json({
                    status: 0,
                    message: "No NFT is not Listed"
                })
            }

        }
        else return res.status(404).json({
            success: false,
            message: "owner not found."
        })
    }
    catch (error) {
        res.status(409).json({ error: error.message })
    }
}

export const isListed = async (req, res) => {
    try {
        const { mintKey } = req.body
        if (mintKey) {
            const nft = await NFTS.findOne({
                mintKey: mintKey
            })
            if (nft) {
                if (nft.inSale == true) {
                    res.status(200).json({
                        status: 1,
                        data: nft,
                        message: "This NFT is Listed"
                    })
                }

            }
            else {
                res.status(200).json({
                    status: 0,
                    message: "This NFT is not found"
                })
            }

        }
        else return res.status(404).json({
            success: false,
            message: "mintKey not found."
        })
    }
    catch (error) {
        res.status(409).json({ error: error.message })
    }
}

// //collections:- nfts owned
export const fetchAllUserOwnedNfts = async (req, res) => {
    try {
        const { publicKey } = req.query
        // const user = await User.findOne({
        //     publicKey
        // })
        // if (user) {
            const nft = await NFTS.find({
                owner : publicKey
            })
            res.status(200).json({
                success: true,
                message: nft
            })
        // } else return res.status(404).json({
        //     success: false,
        //     message: "User not found."
        // })


    } catch (error) {
        res.status(409).json({ error: error.message })
    }
} 
export const isMintKeyVerified = async (req, res) => {
    try {
        const { mintKey } = req.body
       
        const nfts = await NFTS.findOne({
            mintKey
        })
       
        if (nfts) {
            
            if (nfts.collectionName == "Unverified Nfts"){
                return res.status(200).json({
                    success: true,
                    verified: true
                })
            }
            else return res.status(200).json({
                success: true,
                verified: true
            })
        } else return res.status(200).json({
            success: true,
            verified: false
        })

    } catch (error) {
        res.status(409).json({ error: error.message })
    }
}

// It after clicking on a particular collection it fetches its details as well
// As all the listed nfts of that particular collection
export const FetchListedNftsOfCollection = async (req, res) => {

    const name = req.params.name
    const collection = await Collection.findOne({ name })

    if (collection == undefined) {
        return res.status(400).json(`collection name ${name} does not exist`);
    }
    let listedNfts = [];
    try {
        const nfts = JSON.parse(collection.nfts);
        const length = nfts.length
       
        let i;
        for (i = 0; i < length; i++) {
            const nft = await NFTS.findOne({ mintKey: nfts[i], inSale: true })
            if (!(nft == null)) {
    
                listedNfts.push(nft);
            }
        }
    } catch(error) {
        res.status(409).json({ error: error.message })
    }
   
    if (listedNfts == []) {
        return res.status(200).send("There are No Nfts listed from this collection at the moment ");
    }

    return res.status(200).json(
        {
            success: true,
            message: "Listed Nfts fetched",
            data: listedNfts
        });
}

//1st API Collections owned by the address
//2nd API NFTs owned by the address in those Collections


export const FetchListedOwnedNFTsInCollection = async (req, res) => {

    const { owner, collectionName } = req.body;

    const NFTs = await NFTS.find({ owner: owner, collectionName: collectionName });

    if (NFTs == undefined) {
        return res.status(400).json(`NFT doesn't exist in this collection ${collectionName} for this owner ${owner}`);
    }

    let listedNFTs = [];
    try {
        for (let i = 0; i < NFTs.length; i++) {
            console.log("NFTS", NFTs[i]);
            if (NFTs[i].inSale == true) {
                listedNFTs.push(NFTs[i]);
            }
        }
    }
    catch(error){
        res.status(409).json({ error: error.message })
    }
   
    // console.log("listedNFTs", listedNFTs);

    if (listedNFTs == []) {
        return res.status(200).send("There are No Nfts listed from this collection at the moment ");
    }

    return res.send(listedNFTs);
}


export const FetchOwnedNFTsInCollection = async (req, res) => {

    const { owner, collectionName } = req.body;
    console.log(owner, collectionName);


    const NFTs = await NFTS.find({ owner: owner, collectionName: collectionName });

    if (NFTs == undefined) {
        return res.status(400).json(`NFT doesn't exist in this collection ${collectionName} for this owner ${owner}`);
    }

    let ownedNFTs = [];
    try {
        for (let i = 0; i < NFTs.length; i++) {
            console.log("NFTS", NFTs[i]);
            if (NFTs[i].inSale == false) {
                ownedNFTs.push(NFTs[i]);
            }
        }
    }
    catch (error){
        res.status(409).json({ error: error.message })
    }
    


    if (ownedNFTs == []) {
        return res.status(200).send("There are No Nfts listed from this collection at the moment ");
    }

    return res.send(ownedNFTs);
}

export const buyNft = async (req, res) => {
    const { mintKey, owner, buyer, txid } = req.body
    try {

        if (mintKey) {
            const nft = await NFTS.findOne({
                mintKey: mintKey,
                owner: owner
            })
            if (nft && nft.inSale == true) {
               
                    nft.owner = buyer
                    const priceAmount = nft.priceAmount;
                    const collectionName = nft.collectionName
                    const collection = await Collection.findOne({ name: collectionName })
                    let totalListedNfts = collection.totalListedNfts;

                    //Updating activities
                    const buyerActivity = {
                        mintKey: mintKey,
                        type: 'buy',
                        buyer: buyer,
                        seller: owner,
                        priceAmount: priceAmount,
                        transactionId: txid
                    }

                    let buyer2 = await User.findOne({ publicKey: buyer });
                    if (!buyer2) {
                        buyer2 = new User({
                            publicKey: buyer,
                            signature: "",
                            isSigned: true
                        });
                        await buyer2.save();
                    }
                    buyer2.activity.push(buyerActivity);


                    const sellerActivity = {
                        mintKey: mintKey,
                        type: 'sell',
                        buyer: buyer,
                        seller: owner,
                        priceAmount: priceAmount,
                        transactionId: txid

                    }

                    const collectionActivity = {
                        mintKey: mintKey,
                        type: 'sale',
                        buyer: buyer,
                        seller: owner,
                        priceAmount: priceAmount,
                        transactionId: txid
                    }

                    const seller = await User.findOne({ publicKey: owner });
                    seller.activity.push(sellerActivity);

                    //Updating collectio stats
                    const owners = await Collection.findOne({ owners: buyer, name: collectionName })
                    const nfts = await NFTS.find({ owner: owner, collectionName: collectionName });
                 
                    if (nfts.length <= 1) {
                        collection.owners = await collection.owners.filter(publicKey => publicKey != owner);
                    }
                
                    if (!owners) {
                        await collection.owners.push(buyer);
                    }

                    collection.totalUniqueHolders = collection.owners.length
                    collection.totalListedNfts = --totalListedNfts;
                    collection.tradingVolume += nft.priceAmount;

                    await collection.activity.push(collectionActivity);

                    nft.inSale = false
                    await nft.save();

                    const Nfts = collection.nfts;
                    const length = Nfts.length
                 
                    let listedNfts = [];
                    let floorPrice = Number.MAX_SAFE_INTEGER;

                    //Floor prize calculation for a collection
                    for (let i = 0; i < length; i++) {
                        const nft = await NFTS.findOne({ mintKey: Nfts[i], inSale: true })
                       
                        if (!(nft == null)) {
                            if(nft.priceAmount <= floorPrice){
                               floorPrice = nft.priceAmount; 
                            }
                            listedNfts.push(nft);
                        }
                    }
                    if(floorPrice == Number.MAX_SAFE_INTEGER){
                        floorPrice = 0;
                    }
                    collection.floorPrice = floorPrice;

                    await collection.save();
                    await nft.save();
                    await seller.save();
                    await buyer2.save();
                    const trade = new MarketPlex({
                        trades: priceAmount,
                    });
                    await trade.save();
                    return res.status(200).json({
                        status: 1,
                        data: nft, collection,
                        message: "This NFT is sold"
                    })
                

            }
            else {
                res.status(200).json({
                    status: 0,
                    message: "This NFT is not found, or not in sale"
                })
            }

        }
        else return res.status(404).json({
            success: false,
            message: "Nft is not found"
        })
    }
    catch (error) {
        res.status(409).json({ error: error.message })
    }
}

export const cancelNFTListing = async (req, res) => {
    try {

        const { mintKey, owner } = req.body
        if (mintKey) {
            const nft = await NFTS.findOne({
                mintKey: mintKey,
                owner: owner
            })
            if (nft) {
                if (nft.inSale == true) {
                    nft.inSale = false
                    const priceAmount = nft.priceAmount
                    const collectionName = nft.collectionName
                    const collection = await Collection.findOne({ name: collectionName })
                    console.log(collection);

                    const activity = {
                        mintKey: mintKey,
                        type: 'cancelListing',
                        seller: owner,
                        priceAmount: priceAmount,
                    }

                    const user = await User.findOne({ publicKey: owner })
                    user.activity.push(activity);


                    let totalListedNfts = collection.totalListedNfts;
                    collection.totalListedNfts = totalListedNfts - 1;
                    await collection.activity.push(activity);
                    await nft.save();
                    await collection.save();
                    await user.save();

                    res.status(200).json({
                        status: 1,
                        data: nft, collection,
                        message: "This NFT is cancel for listing"
                    })
                }
                else {
                    res.status(200).json({

                        message: "This NFT is notListed"
                    })
                }

            }
            else {
                res.status(200).json({
                    status: 0,
                    message: "This NFT is not found"
                })
            }

        }
        else return res.status(404).json({
            success: false,
            message: "Nft is not found"
        })
    }
    catch (error) {
        res.status(409).json({ error: error.message })
    }
}

export const mintNFT = async (req,res) => {
    const { nft, user } = req.body
    try{
    const existingNft = await NFTS.findOne({mintKey : nft})

    if(existingNft){
        return
    }
    const newNft = new NFTS({
        mintKey: nft,
        owner: user,
        collectionName: "Minted Nfts",

    })
    await newNft.save();

    const collection = await Collection.findOne({ name: "Minted Nfts" });

    collection.nfts.push(nft);
    collection.owners.push(user);

    await collection.save();
}catch(error){
    res.send(error)
}

    return res.status(200);
}
