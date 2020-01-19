import 'reflect-metadata';
import { container } from 'tsyringe';

import { App } from './App/App';

const appInstance = container.resolve(App);

appInstance.init();

// Assign the app to the window
(<any>window).app = appInstance;
  
