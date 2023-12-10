import { ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';

const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
require('dotenv')
const pinata = new pinataSDK( process.env.NEXT_PUBLIC_PINATA_API_KEY, process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY);
const formidable = require("formidable");

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};



const saveFile = async (file, fields) => {
  try {

  
    console.log(fields);


    const stream = fs.createReadStream(file[0].filepath);
    const options = {
      pinataMetadata: {
        name: fields.namefile[0],
      },
      pinataOptions: {
        cidVersion: 0
    }
    };

   const responseFileImage = await pinata.pinFileToIPFS(stream, options);
    const data = new FormData();
    const quantity = fields.quantity[0];
 

     const  dir =  fs.mkdirSync('./tmp', { recursive: true }, (err) => {
      if (err) throw err;
    });
    console.log("directory"+dir);

    for (let i = 1; i <= quantity; i++) {
      const met = [
        
        {
          "trait_type": "Category",
          "value": fields.namefile[0]
        },
        {
          "trait_type": "Place",
          "value": (i + 1).toString()
        },
        {
          "trait_type": "Date",
          "value": fields.date[0]
        },
        {
          "trait_type": "Localisation",
          "value": fields.localisation[0]
        }
      ];

      const body = {
        description: fields.EventDescription[0],
        image: `https://gateway.pinata.cloud/ipfs/${responseFileImage.IpfsHash}`,
        name: fields.eventName[0],
        attributes: met
        
      };

      const fileName = `${fields.namefile[0]+i}.json`;
      const contenuJSON = JSON.stringify(body, null, 2);
  
      fs.writeFile(`./tmp/${fields.namefile[0]+i}.json`, contenuJSON, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    }); 

    // supprimer les dossier temporaire
   
    }
  const response = await  pinata.pinFromFS('./tmp/', options);
  return response;
  
  } catch (error) {
    throw error;
  }
};

const getFile = async (hash)=>{
const resp =  await fetch(`https://gateway.pinata.cloud/ipfs/${hash}/SDD0.json`, {
        method: "GET",
        headers: {
            
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key: process.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
          },
        
       // body: ipfs,
      //  headers: { 'Content-Type': 'application/json' },
      });
 return resp;

}


export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, async function (err, fields, files) {
        try {
          if (err) {
            console.log({ err });
            return res.status(500).send("Upload Error");
          }
          const response = await saveFile(files.file, fields);
        
        
          console.log(response);
          return res.status(200).send(response);
        } catch (error) {
          console.log(error);
          return res.status(400).send("error")
        }
      });
    } catch (e) {
      console.log(e);
      res.status(500).send("Server Error");
    }
  }  else if(req.method === "GET") {
    const queryParams = req.query;
    console.log(queryParams);
    const hashValue = queryParams.hash;
    const response = await getFile(hashValue);
    
    console.log(response.body);
      
  }
 
}