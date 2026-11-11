import { defineConfig } from "cf/config";

/**
 * Secret-like files were detected but not read or migrated: .env.example, .env.local. Only `secrets.required` entries are migrated.
 * @see https://developers.cloudflare.com/workers/configuration/secrets/
 */

export default defineConfig({
	worker: {
		name: "marday235",
		compatibilityDate: "2026-11-01",
		assets: {
			notFoundHandling: "single-page-application",
		},
	},
});
