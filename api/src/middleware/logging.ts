import logger = require('logops');
import time from '../../../service/src/time';
import onHeaders = require('on-headers');

const ipFromRequest = (req) => {
  const forwardedFor = req.get('X-Forwarded-For');
  if (forwardedFor) {
    const ips = forwardedFor
      .split(/, */)
      .map(ip => ip.trim());

    const last = ips[ips.length - 1];
    if (last) {
      return last;
    }
  }

  return req.ip;
};

export default () => (req, res, next) => {
  const timer = time();

  logger.info('Request from %s: %s %s', ipFromRequest(req), req.method, req.originalUrl);

  onHeaders(res, () => {
    const duration = timer();
    const location = res.get('location');

    logger.info(
      'Response with status %d in %d ms.%s',
      res.statusCode,
      duration,
      location ? ` Location: ${location}` : '');
  });

  next();
};
