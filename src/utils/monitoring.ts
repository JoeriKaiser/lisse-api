import winston from 'winston';
import os from 'os';
import { Context, Next } from 'koa';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

interface SystemMetrics {
  freeMemory: number;
  totalMemory: number;
  loadAvg: number[];
  uptime: number;
  cpuUsage: NodeJS.CpuUsage;
}

export const getSystemMetrics = (): SystemMetrics => ({
  freeMemory: os.freemem(),
  totalMemory: os.totalmem(),
  loadAvg: os.loadavg(),
  uptime: os.uptime(),
  cpuUsage: process.cpuUsage(),
});

export const requestLogger = async (ctx: Context, next: Next): Promise<void> => {
  const start = Date.now();

  try {
    await next();
    const ms = Date.now() - start;

    logger.info({
      type: 'request',
      method: ctx.method,
      path: ctx.path,
      status: ctx.status,
      duration: ms,
      ip: ctx.ip,
    });
  } catch (error) {
    const ms = Date.now() - start;

    logger.error({
      type: 'error',
      method: ctx.method,
      path: ctx.path,
      status: ctx.status,
      duration: ms,
      ip: ctx.ip,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    throw error;
  }
};

export const errorHandler = async (ctx: Context, next: Next): Promise<void> => {
  try {
    await next();
  } catch (err) {
    ctx.status = err instanceof Error && 'status' in err ? (err.status as number) : 500;
    ctx.body = {
      error: {
        message: err instanceof Error ? err.message : 'Unknown error',
        status: ctx.status,
      },
    };

    logger.error({
      type: 'uncaughtError',
      error: {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      },
    });
  }
};

export const healthCheck = async (ctx: Context): Promise<void> => {
  const metrics = getSystemMetrics();
  const uptimeInSeconds = metrics.uptime;
  const uptimeFormatted = formatUptime(uptimeInSeconds);

  ctx.body = {
    status: 'up',
    timestamp: new Date().toISOString(),
    system: {
      memory: {
        free: formatBytes(metrics.freeMemory),
        total: formatBytes(metrics.totalMemory),
        usedPercentage: ((1 - metrics.freeMemory / metrics.totalMemory) * 100).toFixed(2) + '%',
      },
      cpu: {
        loadAverage: {
          '1min': metrics.loadAvg[0].toFixed(2),
          '5min': metrics.loadAvg[1].toFixed(2),
          '15min': metrics.loadAvg[2].toFixed(2),
        },
        usage: {
          user: formatMicroseconds(metrics.cpuUsage.user),
          system: formatMicroseconds(metrics.cpuUsage.system),
        },
      },
      uptime: uptimeFormatted,
    },
  };
};

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function formatMicroseconds(microseconds: number): string {
  return `${(microseconds / 1000000).toFixed(2)} s`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor(((seconds % 86400) % 3600) / 60);
  const remainingSeconds = Math.floor(((seconds % 86400) % 3600) % 60);

  return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
}

export { logger };
