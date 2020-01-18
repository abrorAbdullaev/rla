import 'reflect-metadata';
import { container } from 'tsyringe';
import { App } from './App';

const appInstance = container.resolve(App);

appInstance.liveCheck();
