import {S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand} from "@aws-sdk/client-s3"
import {BUCKET_PAPA, REGION_PAPA, PUBLIC_PAPA, UNA_PAPA} from './config.js'
import fs from 'fs'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'

const client = new S3Client ({
    region: REGION_PAPA,
    credentials: {
        accessKeyId: PUBLIC_PAPA,
        secretAccessKey: UNA_PAPA
    }
})


export async function uploadFile(file) {
  const stream = fs.createReadStream(file.tempFilePath);
  const uploadParams = {
    Bucket: process.env.BUCKET_PAPA,
    Key: file.name,
    Body: stream,
  };

  const command = new PutObjectCommand(uploadParams);
  await client.send(command);

  // Generar la URL del archivo en S3
  const fileURL = `https://${process.env.BUCKET_PAPA}.s3.amazonaws.com/${file.name}`;
  return fileURL;
}


export async function getFiles() {
    const command= new ListObjectsCommand({
        Bucket: BUCKET_PAPA
    })
    return await client.send(command)
    
}

export async function getfile(filename) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_PAPA,
        Key: filename
    })
    return await client.send(command)
    
}

export async function downloadfile(filename) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_PAPA,
        Key: filename
    })
    const result = await client.send(command)
    console.log(result)
    result.Body.pipe(fs.createWriteStream(`./images/${filename}`))
    
}

export async function getfileURL(filename) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_PAPA,
        Key: filename
    })
    return await getSignedUrl(client, command, {expiresIn:3600})
    
}