import axios from 'axios';
import isDev from './isDev';

const HOST = !isDev()
  ? 'https://goa49ho5s0.execute-api.us-east-1.amazonaws.com/prod'
  : 'https://ampd6mk4sh.execute-api.us-east-1.amazonaws.com/dev';

const defaultInstance = {
  baseURL: HOST,
};

const apiCaller = axios.create(defaultInstance);

export default apiCaller;
