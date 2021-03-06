import { HttpException, HttpStatus } from '@nestjs/common';

import { diskStorage } from 'multer';
import { extname } from 'path';
import { SERVER_CONFIG } from '../server.constants';

import * as multerS3 from 'multer-s3';
import { S3, config } from 'aws-sdk';

import { EnvironmentService } from '../environment.variables';
/**
 *  New instance of environment service class
 */
const environmentService = new EnvironmentService('.env');

/**
 *  creating storage variable, this variable will get the configuration (local or production)
 */
 const isS3: boolean = environmentService.get('S3') === 'true';
 
console.log('typeof isS3');
console.log(typeof isS3);
console.log(isS3);

let storage;
if (isS3) {
    config.update({
        accessKeyId: SERVER_CONFIG.awsKey,
        secretAccessKey: SERVER_CONFIG.awsSecret
    });

    const s3 = new S3();

    storage = multerS3({
        s3,
        bucket: SERVER_CONFIG.awsBucket,
        acl: SERVER_CONFIG.awsAcl,
        metadata: (req, file, cb) => {
            cb(null, {fieldName: file.fieldname});
        },
        key: (req, file, cb) => {
            const keyName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            cb(null, `${keyName}${extname(file.originalname)}`)
        }
    });
} else {
    storage = diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
            console.log('multer')
            //  Generating a 32 random chars long string
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            //  Calling the callback passing the random name generated with the original extension name
            cb(null, `${randomName}${extname(file.originalname)}`);
        }
    });
}

/**
 *  Creating variable for exportation
 */
const MulterConfig = {
    storage
};

export {
    MulterConfig
};
