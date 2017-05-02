import isUUID = require('validator/lib/isUUID');

export const createAssertValidUuid = (name) =>
  (uuid) => {
    if (uuid == null || !isUUID(uuid, 4)) {
      throw new Error(`Invalid ${name} ${uuid}`);
    }
  };
