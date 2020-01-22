import { sha256 } from 'js-sha256';
import $ from 'jquery';
import dayjs = require('dayjs');

export interface AuthData {
    encryption: string,
    expiresAt?: dayjs.Dayjs,
}

export class AuthService {
  findMatch(login: string, password: string): Promise<{ isSuccess: boolean, encryption: string }> {
    return new Promise<{ isSuccess: boolean, encryption: string }>((resolve) => {
      $.ajax({
        url: 'https://min.gitcdn.link/repo/abrorAbdullaev/RelayAuth/master/authv2.json',
        method: 'GET',
        success: (response: {[key: string]: string} ) => {
        const passHash = response[sha256(login)];

          if ( passHash && passHash === sha256(password)) {
            resolve({
                isSuccess: true,
                encryption: sha256(login + password),
            });
          }

          resolve({
            isSuccess: false,
            encryption: '',
          })
        },
        error: () => {
          resolve({
            isSuccess: false,
            encryption: '',
          })
        }
      });    
    });
  }
}