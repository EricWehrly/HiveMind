import { IncomingMessage, ServerResponse } from "http";

import fs from 'fs';
import path from 'path';

export default function serveFile(request: IncomingMessage, response: ServerResponse) {

    var filePath = '.' + request.url;
    if (filePath == './') {
        filePath = './index.html';
    }

    console.log(`serving file: ${filePath}`);

    var extname = String(path.extname(filePath)).toLowerCase();

    var contentType = mimeTypes[extname] || 'application/octet-stream';

    if (!(checkFileExistsSync(filePath))) {
        console.error(`${filePath} doesn't exist!`);
        return false;
    }
    fs.readFile(filePath, function (error: NodeJS.ErrnoException | null, content: Buffer) {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./404.html', function (error: NodeJS.ErrnoException | null, content: Buffer) {
                    response.writeHead(404, { 'Content-Type': 'text/html' });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

    return true;
}

function checkFileExistsSync(filepath: string) {
    let flag = true;
    try {
        fs.accessSync(filepath, fs.constants.F_OK);
    } catch (e) {
        flag = false;
    }
    return flag;
}

const mimeTypes: { [key: string]: string; } =
 {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};
