import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import boilerplateRules from "./eslint-rules/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FlatCompat is used to convert eslint-config-next (legacy format) to flat config
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

const config = [
    // Ignore patterns
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "out/**",
            "dist/**",
            ".vercel/**",
            "build/**",
            "coverage/**",
            "**/*.md",
            "**/*.mdx",
            "**/*.json",
            "**/*.jsonc",
            "**/*.css",
            "**/generated/**",
            "src/generated/**",
            "prisma/generated/**",
            ".env*",
            "public/**",
        ],
    },

    // JavaScript/JSX files configuration
    {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
        },
    },

    // Base JavaScript recommended rules
    js.configs.recommended,

    // Next.js configuration (includes React and React Hooks)
    ...compat.extends("next/core-web-vitals"),

    // React configuration
    {
        files: ["**/*.{js,jsx}"],
        plugins: {
            react: pluginReact,
            "react-hooks": pluginReactHooks,
            boilerplate: boilerplateRules,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            // Boilerplate protection rule
            "boilerplate/no-edit-boilerplate": "error",

            // React rules
            "react/react-in-jsx-scope": "off", // Not needed in Next.js
            "react/prop-types": "off", // Using Zod for validation
            "react/display-name": "off",
            "react/no-unescaped-entities": "warn",

            // React Hooks rules
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // General best practices
            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "prefer-const": "warn",
            "no-var": "error",
        },
    },
];

export default config;
