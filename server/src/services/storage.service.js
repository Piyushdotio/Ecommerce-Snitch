import ImageKit from '@imagekit/nodejs';
import { config } from '../config/config.js';


const client=new ImageKit({
    privateKey:config.PRIVATE_KEY
})

export async function fileupload({buffer,fileName,folder="Snitch"}){
    const result=await client.files.upload({
        file:await ImageKit.toFile(buffer),
        fileName,
        folder
    })
    return result
}