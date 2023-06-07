const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: '../../logs/error.log' }),
        new winston.transports.Console()
    ]
});

module.export = logger