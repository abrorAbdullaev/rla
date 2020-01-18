import 'reflect-metadata';
import { container } from 'tsyringe';

import { App } from './App/app';


const appInstance = container.resolve(App);

appInstance.init();

setInterval(() => {
  appInstance.liveCheck();
}, 5000);
