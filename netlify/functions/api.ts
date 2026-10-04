import serverless from 'serverless-http';
import app from '../../server';

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  let p = event.path || '';
  if (p.startsWith('/.netlify/functions/api')) {
    p = p.slice('/.netlify/functions/api'.length);
  }
  if (!p.startsWith('/')) {
    p = '/' + p;
  }
  // If redirect stripped /api, restore it unless it is auth or health
  if (!p.startsWith('/api') && !p.startsWith('/auth')) {
    p = '/api' + (p === '/' ? '' : p);
  }
  event.path = p;
  return serverlessHandler(event, context);
};
