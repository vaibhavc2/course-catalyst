import { ct } from '@/constants';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

morgan.token('styled-route', (req: Request) => ct.chalk.blue(req.path));

type Tokens = morgan.TokenIndexer<
  express.Request<any, any, Record<string, any>>,
  express.Response<any, Record<string, any>>
>;

export const requestLogger = (tokens: Tokens, req: Request, res: Response) => {
  // Use the custom 'styled-route' token in your log format
  return [
    tokens.method(req, res),
    tokens['styled-route'](req, res), // This will highlight the route
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
  ].join(' ');
};
