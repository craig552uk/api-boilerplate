// This is the logger singleton instance for use throughout the application
// It logs messages as JSON to STDOUT and STDERR which makes it easy to consume by LogStash or a similar service
// In addition to the core information provided by bunyan, the package name and version are injected
import * as bunyan from "bunyan";
import { join } from "path";

export class LoggerService {

    /**
     * Get/create the singleton logger instance
     * @param options Optional object of bunyan options
     */
    public static getInstance(options: Partial<bunyan.LoggerOptions> = {}): bunyan {
        if (this.instance) {
            return this.instance;
        }

        // Project metadata
        const metadata = require(join("..", "..", "package.json"));

        // Assign metadata to logger
        options.name = metadata.name;
        options.version = metadata.version;
        options.level = process.env.LOG_LEVEL as bunyan.LogLevel || "trace";

        // Create and return logger
        return (this.instance = new bunyan(options as bunyan.LoggerOptions));
    }

    // Bunyan logger singleton instance
    private static instance: bunyan;
}
