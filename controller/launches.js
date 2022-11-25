import { Launches } from "../model/launches.js";
import { NFTS } from "../model/nfts.js";
import {Collection} from '../model/collection.js'

import GIFEncoder from "gif-encoder-2/src/GIFEncoder.js";
import { createCanvas, Image } from "canvas";
import {createWriteStream, readdir} from 'fs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import axios from 'axios';
import ImageKit from 'imagekit';

async function createGif(algorithm, files) {
  return new Promise(async resolve1 => {

    let c = 0;
    const [width, height] = await new Promise(resolve2 => {
      const image = new Image()
      image.onload = () => resolve2([image.width, image.height])
      image.src = files[c++];
    })
 
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dstPath = path.join(__dirname, 'output', `launch.gif`)
    const writeStream = createWriteStream(dstPath)
    writeStream.on('close', () => {
      resolve1()
    })
 
    const encoder = new GIFEncoder(width, height, algorithm)
    encoder.createReadStream().pipe(writeStream)
    encoder.start()
    encoder.setDelay(400)
 
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    for (const file of files) {
      await new Promise(resolve3 => {
        const image = new Image()
        image.onload = () => {
          ctx.drawImage(image, 0, 0)
          encoder.addFrame(ctx)
          resolve3()  
        }
        image.src = file
      })
    }
  })
}

export const addLaunch = async (req, res) => {
  const {
    CMID,
    image,
    creator,
    mintedUsers,
    description,
    socialLinks,
    priceAmount,
    name,
  } = req.body;
  const existingCMID = await Launches.findOne({ CMID: CMID });
  if (!existingCMID) {
    const newLaunch = new Launches({
      CMID,
      image,
      creator,
      mintedUsers,
      description,
      socialLinks,
      priceAmount,
      name,
    });
    try {
      await newLaunch.save();
      return res.status(201).json({
        message: "Launch is done",
      });
    } catch (e) {
      return res.status(200).json({
        error: e,
      });
    }
  } else {
    return res.status(201).json({
      message: "Candy Machine is already exist",
    });
  }
};
export const fetchLaunches = async (req, res) => {
  try {
    const launches = await Launches.find();
    if (launches) {
      res.status(200).json({
        success: true,
        message: launches,
      });
    } else
      return res.status(404).json({
        success: false,
        message: "No Launch found.",
      });
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

export const mintFromLaunch = async (req, res) => {
  const { mintKey, owner, collectionName } = req.body;
  console.log("collectionName",collectionName);
  const existingCollection = await Collection.findOne({
    name: collectionName,
  });
  console.log("collectionName", existingCollection)
  if (existingCollection) {
    try {
      
       existingCollection.nfts.push(mintKey);
       existingCollection.owners.push(owner);
      await existingCollection.save();
      
      const newNFT = new NFTS({
        mintKey: mintKey,
        owner: owner,
        collectionName: collectionName,
      });
      await newNFT.save();
      return res.status(201).json({
        message: "minted",
      });
    } catch (error) {
      res.status(409).json({ error: error.message });
    }
  } else {
    return res.status(404).json({
      message: "Collection not found",
    });
  }

  newNFT.save();
};
export const makeGIF = async (req, res) => { 
  let {files} = req.body;
  console.log("files",files);
  createGif('neuquant', files);
  function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
  }
  await sleep(4000)
  let data = new FormData();
  data.append('file', './output/launch.gif');

  var imagekit = new ImageKit({
    publicKey : "public_E4S7UF4QkBEuSaAIm8jOWEM2WIQ=",
    privateKey : "private_g1qqNZDsGSq//KQXqPisCYc+Es0=",
    urlEndpoint : "https://ik.imagekit.io/kyzr/"
});
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dstPath = path.join(__dirname, 'output', `launch.gif`)
fs.readFile(dstPath, function(err, data) {
    if (err) throw err;
    imagekit.upload({
     file : data, 
     fileName : "launch.gif",
    }, function(error, result) {
     if(error) console.log(error);
      else {
        console.log(result);
        res.status(200).json({
          success: true,
          url: result.url
        })
      }
    });
  });

}
export const fetchLaunchByCMID = async (req, res) => {

  const { CMID } = req.body

  const Launch = await Launches.findOne({ CMID: CMID });
  // const collection = await Collection.find({creator : creator, name : name});

  console.log("Launch by address", Launch);

  if (Launch == undefined) {
      return res.status(401).json("No Launch at the moment to fetch");
  }
  let soc = Launch.socialLinks;

  return res.status(200).json({soc:soc,launch:Launch});

}
