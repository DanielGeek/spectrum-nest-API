/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { S3 } from 'aws-sdk';
import * as nodeGeoCoder from 'node-geocoder';

interface GeocodeResponse {
  longitude: number;
  latitude: number;
  formattedAddress: string;
  city: string;
  stateCode: string;
  countryCode: string;
  zipcode: string;
}

interface GeocodingResult {
  type: string;
  coordinates: [number, number];
  formattedAddress: string;
  city: string;
  stateCode: string;
  countryCode: string;
  zipcode: string;
}

export default class APIFeatures {
  static async getRestaurantLocation(
    address: string,
  ): Promise<GeocodingResult | null> {
    try {
      const options = {
        provider: process.env.GEOCODER_PROVIDER,
        httpAdapter: 'https',
        apiKey: process.env.GEOCODER_API_KEY,
        formatter: null,
      };

      const geoCoder: nodeGeoCoder.Geocoder = nodeGeoCoder(options);

      const loc = (await geoCoder.geocode(
        address,
      )) as unknown as GeocodeResponse[];

      if (!loc || loc.length === 0) {
        return null;
      }

      const location: GeocodingResult = {
        type: 'Point',
        coordinates: [Number(loc[0].longitude), Number(loc[0].latitude)],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        stateCode: loc[0].stateCode,
        countryCode: loc[0].countryCode,
        zipcode: loc[0].zipcode,
      };

      return location;
    } catch (error: unknown) {
      console.error(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
      return null;
    }
  }

  // Upload images
  static async upload(files) {
    return new Promise((resolve, _reject) => {
      const s3 = new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      });

      const images: S3.ManagedUpload.SendData[] = [];

      files.forEach(async (file) => {
        const splitFile = file.originalname.split('.');
        const random = Date.now();

        const fileName = `${splitFile[0]}_${random}.${splitFile[1]}`;

        const params = {
          Bucket: `${process.env.AWS_S3_BUCKET_NAME}/restaurants`,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResponse = await s3.upload(params).promise();

        images.push(uploadResponse);

        if (images.length === files.length) {
          resolve(images);
        }
      });
    });
  }

  // Delete images
  static async deleteImages(images: { Key: string }[]) {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    const imagesKeys = images.map((image) => {
      return {
        Key: image.Key,
      };
    });

    const params = {
      Bucket: `${process.env.AWS_S3_BUCKET_NAME}`,
      Delete: {
        Objects: imagesKeys,
        Quiet: false,
      },
    };

    return new Promise((resolve, reject) => {
      s3.deleteObjects(params, function (err, _data) {
        if (err) {
          console.log(err);
          reject(new Error(`Failed to delete images: ${err.message}`));
        } else {
          resolve(true);
        }
      });
    });
  }
}
