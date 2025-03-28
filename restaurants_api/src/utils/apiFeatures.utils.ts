/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
}
