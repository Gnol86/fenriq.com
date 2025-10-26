import { defineConfig } from "prisma/config";
import path from "node:path";
import { config } from "dotenv";

// Load environment variables from .env file
config();

export default defineConfig({
    schema: path.join("prisma", "schema"),
});
