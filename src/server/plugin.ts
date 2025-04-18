import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from "../../../src/core/server";

import { CustomPluginPluginSetup, CustomPluginPluginStart } from "./types";
import { defineRoutes } from "./routes";

export class CustomPluginPlugin
  implements Plugin<CustomPluginPluginSetup, CustomPluginPluginStart>
{
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug("custom_plugin: Setup");
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug("custom_plugin: Started");
    return {};
  }

  public stop() {}
}
