const swaggerAutogen = require('swagger-autogen')();
const fs = require('fs').promises; // Ensure to use the promise-based version of fs

const doc = {
  openapi: '3.0.0', // use with openapi, not with swagger
  info: {
    title: 'LMS API',
    version: '1.0.0',
    description: 'Express API with TypeScript',
  },
  // host: 'localhost:3000', // use with swagger, not with openapi
  // basePath: '/api/v1', // use with swagger, not with openapi
  servers: [
    // use with openapi, not with swagger
    {
      url: 'http://localhost:3000/api/v1',
      description: 'API V1',
    },
  ],
};

const outputFile = '../swagger-output.json';
const finalOutputFile = './swagger-output.json';
const endpointsFiles = ['../src/router/v1.router.ts'];

// swaggerAutogen(outputFile, endpointsFiles, doc);

// Post-processing function to remove Swagger-specific fields
function removeSwaggerFields(json) {
  if (json.swagger) delete json.swagger; // Remove swagger field if present
  // Add more fields to check and remove as necessary
  return json;
}

// Generate the Swagger documentation and apply post-processing
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  const generatedJson = require(outputFile); // Load the generated JSON
  const cleanedJson = removeSwaggerFields(generatedJson); // Clean the JSON
  // Write the cleaned JSON back to the file or proceed as needed
  fs.writeFile(finalOutputFile, JSON.stringify(cleanedJson, null, 2), 'utf8')
    .then(() => console.log('Swagger fields removed successfully.'))
    .catch((error) => console.error('Error writing JSON file:', error));
});
