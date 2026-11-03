import { bootstrapApplication } from '@angular/platform-browser';
import { PortfolioDemoApp } from './app/portfolio-demo/portfolio-demo.app';
import { portfolioDemoConfig } from './app/portfolio-demo/portfolio-demo.config';

bootstrapApplication(PortfolioDemoApp, portfolioDemoConfig).catch((error) => console.error(error));
