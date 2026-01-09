import { Elysia } from "elysia";
import mongoose, { type ConnectOptions } from "mongoose";
import { cors } from "@elysiajs/cors";
import { DBStarter } from "./controllers/db";
import { openapi } from '@elysiajs/openapi'

import { pluginSchedule } from "./routes/schedules.routes";
import { pluginSession } from "./routes/sessions.routes";
import { pluginSection } from "./routes/sections.routes";
import { pluginSubject } from "./routes/subjects.routes";
import { pluginUser } from "./routes/user.routes";
import { pluginEvent } from "./routes/event.routes";

const username = encodeURIComponent("DanCas");
const password = encodeURIComponent("queso");

// URI de MongoDB configurable vía variables de entorno.
// Si no está definida MONGO_URI, se usa la conexión local por defecto.
const uri = process.env.MONGO_URI;

const clientOptions: ConnectOptions = {};
const controladordb: DBStarter = await DBStarter.run(uri);
const port = Number.parseInt(process.env.PORT ?? "4000", 10) || 4000;
const hostname = process.env.HOST ?? "0.0.0.0";

class main {
	public controller;
	public dbController;
	constructor(controladordb: DBStarter) {
		this.dbController = controladordb;
		// Semilla de usuario administrador opcional al iniciar el servidor
		// Variables de entorno:
		// CREATE_ADMIN_ON_START=true|false (por defecto true)
		// ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_TYPE (1=usuario, 2=profe, 3=profeEspecial, 4=admin por convención actual)
		const shouldCreateAdmin = (process.env.CREATE_ADMIN_ON_START ?? "true").toLowerCase() === "true";
		const adminEmail = process.env.ADMIN_EMAIL ?? "Admin@gmail.com";
		const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin";
		// Default a 4 (admin). Se parsea seguro, si falla queda 4.
		const adminType = Number.parseInt(process.env.ADMIN_TYPE ?? "4") || 4;

		if (shouldCreateAdmin) {
			// No await bloqueante del servidor: disparamos y registramos resultado
			(async () => {
				try {
					const existing = await controladordb.userModel.findOne({ email: adminEmail });
					if (!existing) {
						const user = new controladordb.userModel({
							email: adminEmail,
							password: adminPassword,
							tipo: adminType,
						});
						await user.save();
						console.log(`Admin user created: ${adminEmail} (tipo=${adminType})`);
					} else {
						console.log(`Admin user already exists: ${adminEmail}`);
					}
				} catch (err) {
					console.error("Failed to ensure admin user:", err);
				}
			})();
		}
		const controlador = new Elysia()
			.use(cors())
			.use(openapi())
			.get("/", () => "Hello Elysia")
			.use(pluginSchedule({ prefix: "Schedules" }, controladordb))
			.use(pluginSession({ prefix: "Sessions" }, controladordb))
			.use(pluginSection({ prefix: "Sections" }, controladordb))
			.use(pluginSubject({ prefix: "Sections" }, controladordb))
			.use(pluginUser({ prefix: "Sections" }, controladordb))
			.use(pluginEvent({ prefix: "/api/events" }, controladordb))

			.onError(({ code }) => {
				if (code === "NOT_FOUND") return "Route not found :{";
			})
			.listen({
				hostname,
				port,
			});

		console.log(
			`🦊 Elysia is running at ${controlador.server?.hostname}:${controlador.server?.port}`,
		);
		this.controller = controlador;
	}
	/**
	 * Start
	 */
	static Start() {
		const app = new main(controladordb);
		
	}
}

main.Start();


