/**************************************************************
 * UTILITY FUNCTIONS
 * - scroll to BEGIN CONFIG to provide the config values
 *************************************************************/


/* **
 * Command Line Params
* 
*    editionCount argv[2]: Number of individual NFTs to create
*
*/


const fs = require("fs");
const editionCount = parseInt(process.argv[2]);
const owningWallet = process.argv[3];
const width = 800;
const height = 800;
const description = 'Owning one of these guarantees you a random drop of the minted collection, all more individual and more artistic than any others before them.  Learn more about the project by visiting the link below https://kodamanft.art/';
const max_layers = 8; //Maximum number of layers for the project

//Rarity definitions.  Represents the chance of pulling from this specific folder 
const rarity_types = {
  0.0123: "04_extra_rare",
  25.0000: "03_rare",
  50.555: "02_special",
  99.997: "01_common"
};

const layer_names = {
  0: "Background",
  1: "Framing Element",
  2: "Side Accessory",
  3: "Skull",
  4: "Jaw Ornament",
  5: "Forehead Ornament",
  6: "Face Ornament Left",
  7: "Face Ornament Right",
  8: "Mouth",
  9: "Eye Ornament Left",
  10: "Eye Ornament Right",
  11: "Eye Sockets",
  12: "Nose Shape",
  13: "Eyes",
  14: "Facial Hair",
  15: "Face Accessory",
  16: "Head Top",
}

const traitDefinition = {
  "trait_type": "",
  "value": ""
}


const addLayers = (max_items) => {
  const allDNA = [];
  const itemDNA = [];
  let stats = [];
  const allDNAIds = JSON.parse(fs.readFileSync('./input/masterDNA.json',{encoding:'utf-8', flag:'r'})).DNAList;
  
  for (let item = 0; item < max_items; item++) {
    let dnaValue = '*';
    let thisNFT = {};
    let itemDNA = [];
    let layerTraits = [];
    //Get the random number for this layer
    for (let currLayer = 0; currLayer < max_layers; currLayer++) {
      // For each layer
      let layerSelected = false;
      console.log(`Calculating layer ${currLayer} for edition ${item}`);
      let randSeed = Math.random() * 100;
      // Get the layer by rarity folder name
      const numRarityTypes = Object.keys(rarity_types).length;

      for (let rarityType = 0; rarityType <= numRarityTypes; rarityType++) {
        if (!layerSelected) {
          const rarityValues = Object.keys(rarity_types);
          let selectedRarityValue = rarityValues[rarityType];
          //If the rarity is above the current type, then select it.
          console.log(`Evaluating ${selectedRarityValue} against the randomly generated seed ${randSeed}`);
          if (!layerSelected && selectedRarityValue >= randSeed) {
            const thisNFT = {
              "layer": currLayer == 0 ? 'background' : `layer${currLayer}`,
              "rarity": rarity_types[selectedRarityValue],
            }
            thisNFT.fileLocation = `./input/${thisNFT.layer}/${thisNFT.rarity}`;
            var fileList = fs.readdirSync(thisNFT.fileLocation);
            //pick one of the files in the directory to use
            console.log(fileList);
            if (fileList.length != 0) {
                let fileindex = Math.floor(Math.random() * fileList.length);
                thisNFT.fileURI = `${thisNFT.fileLocation}/${fileList[fileindex]}`;






                if (fs.existsSync(thisNFT.fileURI)) {
                  console.log(`I am using the file: ${thisNFT.fileURI}`);
                  console.log(`The file name is ${fileList[fileindex]}`);
                  itemDNA.push({
                    layer: thisNFT.layer,
                    rarity: thisNFT.rarity,
                    fileLocation: thisNFT.fileLocation,
                    fileURI: thisNFT.fileURI,
                    filename: fileList[fileindex],
                  });
  
  
  
  
  
                  layerSelected = true;
                  dnaValue += parseInt(currLayer) + thisNFT.rarity.substring(0, 2) + fileindex + '*';
                  layerTraits.push({
                    trait_type: layer_names[currLayer],
                    value: fileList[fileindex].substring(0, fileList[fileindex].indexOf('.')),
                    //value: thisNFT.rarity.substring(3),
                  });
                }
              //TODO: compile stats
              //stats = compileStatistics(stats, currLayer, thisNFT.rarity.substring(0, 2), selectedRarityValue);
              //make sure it ends when one is pushed.
            } else {
              console.log(`File ${thisNFT.fileLocation} not found in /input.  Selecting another file for this layer.`);
            }
          } else {
            console.log(`*****************************************`);
            console.log(`rarity ${selectedRarityValue} is not greater than or equal to ${randSeed}`);
            console.log(`*****************************************`);
          }
        }
      }
      //End of rarity selection
    }
    //End of layer generation

      // Check to make sure that the DNA is unique 
     if (allDNAIds.indexOf(dnaValue) == -1) {
       try {
      //Check to make sure that the file exists for this file location
          layerTraits.push({trait_type: "DNA",
                            value: dnaValue
                          });
          allDNA.push({ itemId: item, dna: { ...itemDNA }, dnaId: dnaValue, attributes: layerTraits });
          allDNAIds.push(dnaValue);
       } catch (err) {
         console.log(err);
       }
    } else {
      console.log(`This DNA already exists: ${dnaValue}`);
      item = item - 1;
    } 
  }
  console.log(`DNA Generation Complete`);
  return { allDNA, allDNAIds };
}

module.exports = {
  width,
  height,
  editionCount,
  description,
  traitDefinition,
  owningWallet,
  addLayers
};
