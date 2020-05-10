import * as Hapi from '@hapi/hapi';
import RegistrationRoutes from './api/registration/routes';
import SeverHealthRoutes from './api/health';
import Logger from './helper/logger';

export default class Router {
    public static async loadRoutes(server: Hapi.Server): Promise<any> {
        try {
            Logger.info('Router - Start adding routes.');
            await SeverHealthRoutes.register(server);
            await RegistrationRoutes.register(server);
            Logger.info('Router - Finish adding routes.');
        } catch (error) {
            Logger.error(`Error in loading routers: ${error}`);
            throw error;
        }
    }
}