import { injectable } from "tsyringe";
import { App as BackgroundApp } from "../../../Background/App/App";

declare global {
  interface Window { app: BackgroundApp }
}

@injectable()
export class BackgroundService {
  getBackground(): Promise<BackgroundApp> {
    return new Promise<BackgroundApp>((resolve, reject) => {
      chrome.runtime.getBackgroundPage((bg) => {
        if (bg) {
          resolve(bg.app);
        } else {
          reject('Background App Is Not Found');
        }
      });
    });
  }

  getCurrentTab(): Promise<chrome.tabs.Tab> {
    return new Promise<chrome.tabs.Tab>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        resolve(tabs[0]);
      });
    });
  }
}