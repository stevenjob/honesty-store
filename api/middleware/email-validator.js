const isEmail = require('validator/lib/isEmail');
const HTTPStatus = require('http-status');

const validateEmail = (request, response, next) => {
  const { emailAddress } = request.body;

  if (emailAddress == null) {
    response.status(HTTPStatus.UNAUTHORIZED)
      .json({
        error: {
          message: 'No email address provided',
        },
      });
    return;
  }

  if (!isEmail(emailAddress)) {
    response.status(HTTPStatus.UNAUTHORIZED)
      .json({
        error: {
          message: 'Invalid email address provided',
        },
      });
    return;
  }

  // eslint-disable-next-line no-param-reassign
  request.emailAddress = emailAddress;
  next();
};

module.exports = validateEmail;
