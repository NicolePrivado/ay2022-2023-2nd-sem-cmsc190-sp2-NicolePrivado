import crypto from '../crypto'
import { randomBytes } from 'react-native-randombytes'
import { SECRET } from '@env'

const algorithm = "aes-256-gcm"; 
secret_key = crypto.pbkdf2Sync(SECRET,'salt', 1000, 32, 'sha512');

export const encryptData = (text) =>{
    const iv = randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret_key, 'hex'), iv);

    let encrypted = cipher.update(text, "utf-8", "hex");
    encrypted += cipher.final("hex");

    const auth_tag = cipher.getAuthTag().toString('hex')

    const payload = iv.toString('hex') + encrypted + auth_tag
    const payload64 = Buffer.from(payload, 'hex').toString('base64')
    
    return payload64
}

export const decryptData = (payload64) => {
    const payload = Buffer.from(payload64, 'base64').toString('hex')
    const iv = payload.substring(0,32)
    const encrypted = payload.substring(32,payload.length-32)
    const auth_tag = payload.substring(payload.length - 32, payload.length)

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret_key, 'hex'), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(auth_tag, 'hex'))
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    
    decrypted += decipher.final("utf8");

    return decrypted
}
