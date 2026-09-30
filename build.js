import * as oFs from 'fs/promises';
import { promisify as oPromisify } from 'node:util';
import oChildProcess from 'node:child_process';

const sApplicationSourcePath = './src';
const sApplicationResourceSourcePath = './resources';
const sApplicationDistributionPath = './app';
const sLibPath = './app';

const oMkDirOptions = {
    recursive: true,
};

const aFilesToExcludeFromApp = [
    'source-file-1.js',
    'dont-include-me-2.js',
    'dont-include-me-3.html',
];

// filters the content to copy
const filterFiles = function (sSrcPath) {
    const sFileToCheck = sSrcPath.substring(sSrcPath.indexOf('src/') + 4);
    if (aFilesToExcludeFromApp.includes(sFileToCheck)) {
        console.log(`checking file: ✗ not copying ${sFileToCheck}`);
        return false;
    }
    console.log(`checking file: ✔︎     copying ${sFileToCheck}`);
    return true;
};

// copies all sources to application distribution path
const oSrcToDistCopyOptions = {
    recursive: true,
    filter: filterFiles,
};

oFs.mkdir(sApplicationDistributionPath, oMkDirOptions)
    .then((oResult) => {
        console.log(`[success] mkdir ${sApplicationDistributionPath}`);

        // copies src to app directory
        oFs.cp(
            sApplicationSourcePath,
            sApplicationDistributionPath,
            oSrcToDistCopyOptions,
        )
            .then((oResult) => {
                console.log(`[success] copied dir ${sApplicationSourcePath}`);
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`  [error] details: ${oError}`);
    });

oFs.mkdir(sLibPath, oMkDirOptions)
    .then((oResult) => {
        console.log(`[success] mkdir ${sLibPath}`);

        oFs.copyFile(
            './node_modules/learnhypertext/js/index.mjs',
            `${sLibPath}/learnhypertext.mjs`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copied file ${sLibPath}/learnhypertext.mjs`,
                );
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`  [error] details: ${oError}`);
    });

const execFile = oPromisify(oChildProcess.execFile);
execFile('scripts/build-images.sh').then((oResult) => {
    console.log('generated images with the following result');
    console.log(oResult);
}).catch((oError) => {
    console.log(oError);
})
