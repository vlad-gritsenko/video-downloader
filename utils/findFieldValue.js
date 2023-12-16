function findFieldValue(obj, fieldName) {
  for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
          if (key === fieldName) {
              return obj[key];
          } else if (typeof obj[key] === 'object') {
              const result = findFieldValue(obj[key], fieldName);
              if (result !== undefined) {
                  return result;
              }
          }
      }
  }
  return undefined; // Field not found
}

exports.findFieldValue = findFieldValue;