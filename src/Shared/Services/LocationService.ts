import { injectable } from "tsyringe";
import $ from 'jquery';

export interface LocationLatLong {
  success: boolean,
  location: string;
  latLong: {
    lat: number;
    long: number;
  }
}

@injectable()
export class LocationService {
  private cachedLocationLatLongs: Array<LocationLatLong> = [];

  public getLocationLatLong(locationQuery: string): Promise<LocationLatLong> {    
    return new Promise<LocationLatLong>((resolve) => {
      if (!!locationQuery) {
        const cachedLatLong = this.cachedLocationLatLongs.find((locationLatLong) => {
          return locationLatLong.location == locationQuery;
        });

        if (!!cachedLatLong) {
          resolve(cachedLatLong);
        } else {
          $.ajax('https://api.opencagedata.com/geocode/v1/json', {
            data: {
              q: locationQuery + ' USA',
              // Personal key, to be changed if account changes
              key: '28c7706559f245ac95b1025b8a62aa04'
            },
            success: (resp: { results: Array<{geometry: { lat: number; lng: number; }}>}) => {
              if (!resp.results.length) {
                resolve(undefined);
                return;
              }

              this.cachedLocationLatLongs.push({
                success: true,
                location: locationQuery,
                latLong: {
                  lat: resp.results[0].geometry.lat,
                  long: resp.results[0].geometry.lng,
                }
              } as LocationLatLong);

              resolve(this.cachedLocationLatLongs.find((cachedLatLong) => cachedLatLong.location == locationQuery));
            },
            error: () => {
              resolve(undefined);
              return;
            }
          });
        }
      } else {
        resolve({
          success: false,
          location: '',
          latLong: {
            lat: 0,
            long: 0,
          }
        });
      }
    });
  }

  
  calculateDistance(locationLatLong1: LocationLatLong, locationLatLong2: LocationLatLong ) {
    if (
      (locationLatLong1.latLong.lat == locationLatLong2.latLong.lat) 
      && (locationLatLong1.latLong.long == locationLatLong2.latLong.long)
    ) {
      return 0;
    }
    
    var radlat1 = Math.PI * locationLatLong1.latLong.lat/180;
    var radlat2 = Math.PI * locationLatLong2.latLong.lat/180;
    var theta = locationLatLong1.latLong.lat - locationLatLong2.latLong.lat;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    
    // if (unit=="K") { dist = dist * 1.609344 } // Kilometers
    // if (unit=="N") { dist = dist * 0.8684 } // Natural miles

    return dist;
  }
}