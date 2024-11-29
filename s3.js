import {S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand} from "@aws-sdk/client-s3"
import {AWS_BUCKET_NAME, AWS_BUCKET_REGION, AWS_PUBLIC_KEY, AWS_SECRET_KEY} from './config.js'
import fs from 'fs'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'

const client = new S3Client ({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_PUBLIC_KEY,
        secretAccessKey: AWS_SECRET_KEY
    }
})


export async function uploadFile(file) {
  const stream = fs.createReadStream(file.tempFilePath);
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file.name,
    Body: stream,
  };

  const command = new PutObjectCommand(uploadParams);
  await client.send(command);

  // Generar la URL del archivo en S3
  const fileURL = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${file.name}`;
  return fileURL;
}


export async function getFiles() {
    const command= new ListObjectsCommand({
        Bucket: AWS_BUCKET_NAME
    })
    return await client.send(command)
    
}

export async function getfile(filename) {
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    })
    return await client.send(command)
    
}

export async function downloadfile(filename) {
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    })
    const result = await client.send(command)
    console.log(result)
    result.Body.pipe(fs.createWriteStream(`./images/${filename}`))
    
}

export async function getfileURL(filename) {
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: filename
    })
    return await getSignedUrl(client, command, {expiresIn:3600})
    
}