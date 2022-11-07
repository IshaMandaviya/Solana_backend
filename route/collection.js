import express from "express"
import { addCollection, fetchAllCollection, fetchCollection, FetchListedNftsOfCollection,getCollectionInfo,FetchCollectionsByAddress,fetchTradingVolumeBasedOnTimestamp } from "../controller/collection.js";

const router = express.Router()

router.post('/addCollection',addCollection);
router.get('/fetchCollection',fetchCollection);
router.post('/fetchAllCollection',fetchAllCollection);
router.get('/FetchListedNftsOfCollection/:name',FetchListedNftsOfCollection);
router.get('/getCollectionInfo/:name',getCollectionInfo);
router.post('/FetchCollectionsByAddress',FetchCollectionsByAddress);
router.get('/fetchTradingVolumeBasedOnTimestamp',fetchTradingVolumeBasedOnTimestamp);
export default router;