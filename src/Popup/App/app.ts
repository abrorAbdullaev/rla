import { injectable } from "tsyringe";
import { Background } from "../Models";

@injectable()
export class App {
  // private bg: Background = null;

  init(): void {
    this.isPageRelay().then((isRelay: boolean) => {
      isRelay 
        ? console.log('Relay')
        : console.log('Not Relay');
    });
  }

  liveCheck(): void {
    console.log('Live Check: ');
  }

  private isPageRelay(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        
        resolve(Boolean(tab && tab.url && tab.url.includes('relay.amazon.com/tours/loadboard')));
      });
    });
  }
}
