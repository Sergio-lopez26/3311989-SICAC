module.exports = {
testEnvironment: 'node'
,
transform: {
'^.+\\.js$': 'babel-jest'
,
},
moduleFileExtensions: ['js'
,
'json'],
testMatch: ['**/__tests__/**/*.test.js' //Carpeta donde se realizaran los testeos
,
'**/?(*.)+(spec|test).js'],
clearMocks: true,//Limpia los mocks automaticamnete entre pruebas
};