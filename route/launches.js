
import express from "express"
import {addLaunch,fetchLaunches,mintFromLaunch,makeGIF,fetchLaunchByCMID} from "../controller/launches.js"
const router = express.Router();
router.post('/addLaunch', addLaunch);
router.get('/fetchLaunches',fetchLaunches);
router.post('/mintFromLaunch',mintFromLaunch);
router.post('/makeGIF',makeGIF);
router.post("/fetchUsingCMID",fetchLaunchByCMID)
export default router;