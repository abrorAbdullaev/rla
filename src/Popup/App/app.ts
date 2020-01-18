import * as Mustache from 'mustache';
import { injectable } from "tsyringe";
import { Background } from "../Models";
import { PopupService } from '../Services/PopupService';


@injectable()
export class App {
  // private bg: Background = null;

  constructor(
    private readonly popupService: PopupService
  ) {}

  init(): void {
    this.isPageRelay().then((isRelay: boolean) => {
      isRelay 
        ? console.log('Relay')
        : console.log('Not Relay');
    });

    const output = Mustache.render(" Hello World ", {});

    console.log(output);

    this.popupService.renderContent(output);
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
