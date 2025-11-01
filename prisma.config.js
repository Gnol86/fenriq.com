import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env file
config();

export default defineConfig({
    schema: path.join("prisma", "schema"),
});
