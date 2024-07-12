import { envConfig } from '#/config/env.config';

const { isDev } = envConfig;

class ZodError {
  required = (fieldName: string | string[], detailedError: boolean = false) => {
    const errString = 'Please fill in all the required fields!';

    if (isDev || detailedError) {
      if (typeof fieldName === 'string') {
        return (
          fieldName.charAt(0).toUpperCase() +
          fieldName.slice(1) +
          " can't be empty! " +
          errString
        );
      } else {
        const firstFieldName = fieldName[0];
        const capitalizedFirstFieldName =
          firstFieldName.charAt(0).toUpperCase() + firstFieldName.slice(1);
        const restOfFieldNames = fieldName.slice(1);
        return (
          [capitalizedFirstFieldName, ...restOfFieldNames].join(', ') +
          " can't be empty! " +
          errString
        );
      }
    } else return errString;
  };

  largeString = (fieldName: string, max: number) => {
    return fieldName + ' must not exceed ' + max + ' characters.';
  };

  minString = (fieldName: string, min: number) => {
    return fieldName + ' must be at least ' + min + ' characters.';
  };
}
export const zodErrors = new ZodError();
