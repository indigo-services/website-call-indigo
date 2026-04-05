#!/usr/bin/env node
import { runEasypanelOps } from './easypanel-ops.mjs';

runEasypanelOps(['bootstrap-deploy'])
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
