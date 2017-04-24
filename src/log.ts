const log4js = require('log4js');
log4js.loadAppender('file');
export default function getLogger(name: string) {
    log4js.addAppender(log4js.appenders.file(`logs/${name}.log`), name);
    return log4js.getLogger(name);
};