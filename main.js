const path = require('path');
var net = process.argv[2];
var namespace = 'QuickStart.' + net.charAt(0).toUpperCase() + net.substr(1);
if(net === 'core') net = 'coreapp';
var version = net == 'standard' ? '2.1' : '3.1'

const baseNetAppPath = path.join(__dirname, '/src/'+ namespace +'/bin/Debug/net'+ net + version);

process.env.EDGE_USE_CORECLR = 1;
if(net !== 'standard')
    process.env.EDGE_APP_ROOT = baseNetAppPath;

var edge = require('edge-js');

var baseDll = path.join(baseNetAppPath, namespace + '.dll');

var localTypeName = namespace + '.LocalMethods';
var externalTypeName = namespace + '.ExternalMethods';

var getAppDomainDirectory = edge.func({
    assemblyFile: baseDll,
    typeName: localTypeName,
    methodName: 'GetAppDomainDirectory'
});

var getCurrentTime = edge.func({
    assemblyFile: baseDll,
    typeName: localTypeName,
    methodName: 'GetCurrentTime'
});

var useDynamicInput = edge.func({
    assemblyFile: baseDll,
    typeName: localTypeName,
    methodName: 'UseDynamicInput'
});

var handleException = edge.func({
    assemblyFile: baseDll,
    typeName: localTypeName,
    methodName: 'ThrowException'
});

var getPerson = edge.func({
    assemblyFile: baseDll,
    typeName: externalTypeName,
    methodName: 'GetPersonInfo'
});


console.log('### Calling local methods from ' + namespace +'.dll')
console.log();
getAppDomainDirectory('', function(error, result) {
    if (error) throw error;
    console.log(localTypeName + '.GetAppDomainDirectory');
    console.log(result);
    console.log();
});

getCurrentTime('', function(error, result) {
    if (error) throw error;
    console.log(localTypeName + '.GetCurrentTime');
    console.log(result);
    console.log();
});

useDynamicInput('Node.Js', function(error, result) {
    if (error) throw error;
    console.log(localTypeName + '.UseDynamicInput');
    console.log(result);
    console.log();
});

console.log();
console.log('### Handling exception');
console.log();
try{
    handleException('', function(error, result) {
    });
}catch(e){
    console.log('.NET Exception: ' + e.Message);
}

console.log();
console.log('### Calling external library methods using '+ namespace +'.dll wrapper');
console.log();
getPerson('', function(error, result) {
    if (error) throw error;
    console.log(externalTypeName + '.GetPersonInfo');
    console.log(result);
});


const dataPath = './data/msft.csv';
const printTypes = edge.func({
    language: 'fs',
    source: `
open FSharp.Data

type Stocks = CsvProvider<"${dataPath}">
let sampleRow = Stocks.GetSample()
let rowsProperty = sampleRow.GetType().GetProperties()[0]
printfn "%s" (rowsProperty.PropertyType.FullName)
`,
    references: [
        "dlls/FSharp.Data.dll"
    ]
});
printTypes(null, function (error, result) {
    if (error) throw error;
    console.log(result);
});
