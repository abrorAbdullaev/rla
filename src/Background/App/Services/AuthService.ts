import * as data from './data.json';
import { sha256 } from 'js-sha256';
import dayjs = require('dayjs');

export interface AuthData {
    encryption: string,
    expiresAt?: dayjs.Dayjs,
}

export class AuthService {
    findMatch(login: string, password: string): { success: boolean, encryption: string } {
        let response = {
            success: false,
            encryption: '',
        };

        const creds = data as {[key: string]: string};
        const passHash = creds[sha256(login)];
        
        if (passHash && passHash === sha256(password)) {
            response = {
                success: true,
                encryption: sha256(login + password),
            }
        }

        return response;
    }
}