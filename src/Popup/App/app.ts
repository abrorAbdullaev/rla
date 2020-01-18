import * as Mustache from 'mustache';
import { injectable } from "tsyringe";

import { Background } from "./Models";
import { PopupService } from './Services/PopupService';

declare var require: {
  (path: string): any;
  <T>(path: string): T;
  (paths: string[], callback: (...modules: any[]) => void): void;
  ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

@injectable()
export class App {
  // private bg: Background = null;

  constructor(
    private readonly popupService: PopupService
  ) {}

  init(): void {
    const mainHtml = require('./Template/main.html');
    const wrongPageHtml = require('./Template/wrong.html');

    let output: string;
    
    this.isPageRelay().then((isRelay: boolean) => {
      output = isRelay
        ? Mustache.render(mainHtml, {})
        : Mustache.render(wrongPageHtml, {});

        this.popupService.hideLoader();
        this.popupService.renderContent(output);
      });
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
