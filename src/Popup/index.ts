import 'reflect-metadata';
import { container } from 'tsyringe';

import { App } from './App/App';

const appInstance = container.resolve(App);

document.addEventListener('DOMContentLoaded', () => {
  appInstance.init();
});

