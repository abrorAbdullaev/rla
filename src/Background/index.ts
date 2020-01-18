import 'reflect-metadata';
import { container } from 'tsyringe';

import { App } from './App/app';

const appInstance = container.resolve(App);

appInstance.liveCheck();
appInstance.init();

// Assign the app to the window
(<any>window).app = appInstance;
  
