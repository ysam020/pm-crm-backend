import { logError } from "../config/loggerConfig.mjs";

export function setupGlobalErrorHandlers() {
  // Global unhandled promise rejection handler
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Promise Rejection:");

    if (reason instanceof ReferenceError) {
      logError(reason, `Unhandled ReferenceError: ${reason.message}`, null);
    } else {
      logError(
        reason instanceof Error ? reason : new Error(String(reason)),
        "Unhandled Promise Rejection in application",
        null
      );
    }
  });

  // Global uncaught exception handler
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:");

    if (error instanceof ReferenceError) {
      logError(error, `Uncaught ReferenceError: ${error.message}`, null);
    } else {
      logError(error, "Uncaught Exception in application", null);
    }

    // Give the logger some time to complete before exiting
    setTimeout(() => {
      console.error("Exiting due to uncaught exception");
      process.exit(1);
    }, 1000);
  });
}

// For handling errors that occur during application startup
export function handleStartupError(error) {
  console.error("Error during application startup:");

  if (error instanceof ReferenceError) {
    console.error(`ReferenceError: ${error.message}`);
    console.error(error.stack);
  } else {
    console.error(error);
  }

  // Exit the process with an error code
  process.exit(1);
}
