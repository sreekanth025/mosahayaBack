import * as Boom from '@hapi/boom';
import * as Hapi from '@hapi/hapi';
import * as Path from 'path';
import Logger from './helper/logger';
import Utils from './helper/utils';
import Plugin from './plugin';
import Router from './router';
import Db from './db';
import Strategy from './strategy';

const PORT = Utils.getEnvVariable('PORT', true);
let CORS: any = Utils.getEnvVariable('CORS', true);
CORS = JSON.parse(CORS);
export default class Server {
    public static start = async (): Promise<Hapi.Server> =>{
        try {
            Logger.info(`Hapi base URL: ${__dirname}`);
            Server._instance = new Hapi.Server({
                port: PORT,
                routes: {
                    cors: {
                        origin: CORS,
                        additionalHeaders: ['x-atmosphere-token']
                    },
                    files: {
                        relativeTo: Path.join(__dirname, 'public')
                    },
                    validate: {
                        failAction: async (request: Hapi.Request, h: Hapi.ResponseToolkit, error: Error) => {
                            Logger.debug(`Server - request input error: ${error}`);
                          //  throw Boom.badRequest(`Invalid request payload input`);
                            throw Boom.badRequest(` ${error}`);
                        }
                    }
                }
            });
            Utils.setBaseURL(__dirname);
            await Db.connect();

            await Plugin.registerAll(Server._instance);
            await Strategy.registerAll((Server._instance));
            await Router.loadRoutes(Server._instance);
            await Server._instance.start();

            Logger.info('Server - Up and running!');
            if (process.env.IS_PM2) {
                process.send('ready');
            }
            return Server._instance;
        } catch (error) {
            Logger.error(`Server - There was something wrong: ${error}`);
            process.exit(1);
        }
    };

    public static stop = (): Promise<Error | void> =>{
        Logger.info(`Server - Stopping!`);
        return Server._instance.stop();
    };

    public static recycle = async (): Promise<Hapi.Server> =>{
        await Server.stop();
        return await Server.start();
    };

    public static instance(): Hapi.Server {
        return Server._instance;
    }

    public static inject = async (options: string | Hapi.ServerInjectOptions): Promise<Hapi.ServerInjectResponse> => {
        return await Server._instance.inject(options);
    };

    private static _instance: Hapi.Server;
}
