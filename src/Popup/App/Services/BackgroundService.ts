import { injectable } from "tsyringe";
import { App as BackgroundApp } from "../../../Background/App/App";

declare global {
  interface Window { app: BackgroundApp }
}

@injectable()
export class BackgroundService {
  getBackground(): Promise<Window> {
    return new Promise<Window>((resolve) => {
      chrome.runtime.getBackgroundPage((bg) => {
        resolve(bg);
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