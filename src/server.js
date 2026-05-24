import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 3000;
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Another app (often a leftover "npm start" or Playwright webServer) is bound to it.`,
    );
    console.error(`Free the port, then run again:\n  lsof -i :${port}\n  kill <PID>`);
    console.error(`Or use a different port temporarily: PORT=${port + 1} npm start`);
    process.exit(1);
  }
  throw err;
});
