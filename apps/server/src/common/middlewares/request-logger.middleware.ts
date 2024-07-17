import chalk from 'chalk';
import express, { Request, Response } from 'express';
import morgan from 'morgan';

morgan.token('styled-route', (req: Request) => chalk.blue(req.originalUrl));
morgan.token('styled-method', (req: Request) => chalk.yellow(req.method));
morgan.token('styled-status', (req: Request, res: Response) => {
  const status = res.statusCode;
  const color =
    status >= 500
      ? 'red'
      : status >= 400
        ? 'yellow'
        : status >= 300
          ? 'cyan'
          : 'green';
  return chalk.keyword(color)(status);
});

type Tokens = morgan.TokenIndexer<
  express.Request<any, any, Record<string, any>>,
  express.Response<any, Record<string, any>>
>;

function requestLogger(tokens: Tokens, req: Request, res: Response) {
  return [
    // tokens.method(req, res),
    tokens['styled-method'](req, res), // highlight the method
    'request on route  :: ',
    tokens['styled-route'](req, res), // highlight the route
    'with status',
    tokens['styled-status'](req, res), // highlight the status
    // 'and response size',
    // tokens.res(req, res, 'content-length'), // log the content-length of response in bytes
    ' :: ',
    chalk.magenta(tokens['response-time'](req, res)),
    'ms\n',
  ].join(' ');
}

export default requestLogger;
