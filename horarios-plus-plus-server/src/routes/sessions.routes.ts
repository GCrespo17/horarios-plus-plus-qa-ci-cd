import type mongoose from "mongoose";
import type { DBStarter } from "../controllers/db";
import Elysia, { t } from "elysia";

	export const pluginSession = <T extends string>(
		config: { prefix: T },
		db: DBStarter,
	) =>
		new Elysia({
			name: "my-Session-plugin",
			seed: config,
		})
			.get(`${config.prefix}/hi`, () => "Hi")

			.get("/api/session/get_sessions_from_id", async ({ query }) => {
				console.log(query);

				if (query.id === undefined) {
					return undefined;
				}

				const session = await db.sectionModel.findById(query.id);
				if (session === undefined) {
					return undefined;
				}
				console.log("Session found: ", session);

				return JSON.stringify(session);
			})

			.get("/api/session/get_sessions_from_section", async ({ query }) => {
				if (query.nrc === undefined) {
					return undefined;
				}

				const section = (await db.sectionModel.find({ nrc: query.nrc })).at(0);
				if (section === undefined) {
					return undefined;
				}

				return JSON.stringify(section.sessions);
			})
			.get("/api/session/get_sessions_from_event", async ({ query }) => {
				if (query.name === undefined) {
					return undefined;
				}

				const section = (await db.eventModel.find({ name: query.name })).at(0);
				if (section === undefined) {
					return undefined;
				}

				return JSON.stringify(section.sessions);
			})

			.post("/api/session/add_session_to_section", async ({ query }) => {
				if (
					query.day === undefined ||
					query.start === undefined ||
					query.end === undefined
				) {
					console.error("Alguno de los argumentos es undefined");
					return undefined;
				}

				const section = (await db.sectionModel.find({ nrc: query.nrc })).at(0);
				if (section === undefined) {
					console.error(`No se encontro ${query.nrc}`);
					return undefined;
				}
				
				for (const session of section.sessions) {
					if (
						session.day === Number.parseInt(query.day) &&
						session.start.getTime() === Number.parseInt(query.start) &&
						session.end.getTime() === Number.parseInt(query.end)
					) {
						console.error("Ya existe una sesion con esos datos");
						return undefined;
					}
				}

				const newSession = new db.sessionModel({
					day: 1,
					start: query.start,
					end: query.end,
				});

				section.sessions.push(newSession);
				section.save();
				return JSON.stringify(newSession);
			})
			.post("/api/session/add_session_to_event", async ({ query }) => {
				if (
					query.day === undefined ||
					query.start === undefined ||
					query.end === undefined
				) {
					console.error("Alguno de los argumentos es undefined");
					return undefined;
				}

				const event = (await db.eventModel.find({ name: query.name })).at(0);
				if (event === undefined) {
					console.error(`No se encontro ${query.name}`);
					return undefined;
				}
				
				for (const session of event.sessions) {
					if (
						session.day === Number.parseInt(query.day) &&
						session.start.getTime() === Number.parseInt(query.start) &&
						session.end.getTime() === Number.parseInt(query.end)
					) {
						console.error("Ya existe una sesion con esos datos");
						return undefined;
					}
				}

				const newSession = new db.sessionModel({
					day: 1,
					start: query.start,
					end: query.end,
				});

				event.sessions.push(newSession);
				event.save();
				return JSON.stringify(newSession);
			})

			.get(
				"/api/session/updateSession",
				async ({ query }) => {
					console.log(query);
					const oldDay = query.oldday;
					const oldStart = query.oldstart;
					const oldEnd = query.oldend;

					const newDay = query.newday;
					const newStart = query.newstart;
					const newEnd = query.newend;

					
					if (
						oldDay === undefined ||
						oldStart === undefined ||
						oldEnd === undefined ||
						newDay === undefined ||
						newStart === undefined ||
						newEnd === undefined ||
						query.nrc === undefined
					) {
						console.log(
							"Could not update session, one of the arguments is undefined",
						);
						return undefined;
					}
					const oldSession = {
						day: Number.parseInt(oldDay),
						start: new Date(Number.parseInt(oldStart)),
						end: new Date(Number.parseInt(oldEnd)),
					};

					const section = await db.sectionModel.findOne({ nrc: query.nrc });
					if (section === undefined || section === null) {
						console.log("No section with nrc ", query.nrc, " exists");
						return undefined;
					}
					const newSession = {
						day: Number.parseInt(newDay),
						start: new Date(Number.parseInt(newStart)),
						end: new Date(Number.parseInt(newEnd)),
					};
					let repetido=false;
					// biome-ignore lint/complexity/noForEach: <explanation>
					section.sessions.forEach((session) => {
						console.log("Session: ", session, "OldSession: ", oldSession);
						
						if (
							(session.day === newSession.day &&
							session.start.getTime() === newSession.start.getTime() &&
							session.end.getTime() === newSession.end.getTime())
						) {
							console.log("Could not find session to update");
							repetido=true;
					}});
					if(repetido){
						return undefined;
					}
					// biome-ignore lint/complexity/noForEach: <explanation>
					section.sessions.forEach((session) => {
						console.log("Session: ", session, "OldSession: ", oldSession);
						
						if (
							(session.day === oldSession.day &&
							session.start.getTime() === oldSession.start.getTime() &&
							session.end.getTime() === oldSession.end.getTime()) 
						) {
							console.log("Found session to update: ", session);
							
							session.day = newSession.day;
							session.start = newSession.start;
							session.end = newSession.end;
							session.save();
						}
					});
					section.save();
					console.log("Updated session  to ", section.sessions);
					return JSON.stringify(newSession);
				}
			)
			.put(
				"/api/session/updateSession_from_event",
				async ({ query }) => {
					console.log(query);
					const oldDay = query.oldday;
					const oldStart = query.oldstart;
					const oldEnd = query.oldend;

					const newDay = query.newday;
					const newStart = query.newstart;
					const newEnd = query.newend;

					
					if (
						oldDay === undefined ||
						oldStart === undefined ||
						oldEnd === undefined ||
						newDay === undefined ||
						newStart === undefined ||
						newEnd === undefined ||
						query.nrc === undefined
					) {
						console.log(
							"Could not update session, one of the arguments is undefined",
						);
						return undefined;
					}
					const oldSession = {
						day: Number.parseInt(oldDay),
						start: new Date(Number.parseInt(oldStart)),
						end: new Date(Number.parseInt(oldEnd)),
					};

					const event = await db.eventModel.findOne({ name: query.nrc });
					if (event === undefined || event === null) {
						console.log("No event with nrc ", query.nrc, " exists");
						return undefined;
					}
					const newSession = {
						day: Number.parseInt(newDay),
						start: new Date(Number.parseInt(newStart)),
						end: new Date(Number.parseInt(newEnd)),
					};
					let repetido=false;
					// biome-ignore lint/complexity/noForEach: <explanation>
					event.sessions.forEach((session) => {
						console.log("Session: ", session, "OldSession: ", oldSession);
						
						if (
							(session.day === newSession.day &&
							session.start.getTime() === newSession.start.getTime() &&
							session.end.getTime() === newSession.end.getTime())
						) {
							console.log("Could not find session to update");
							repetido=true;
					}});
					if(repetido){
						return undefined;
					}
					// biome-ignore lint/complexity/noForEach: <explanation>
					event.sessions.forEach((session) => {
						console.log("Session: ", session, "OldSession: ", oldSession);
						
						if (
							(session.day === oldSession.day &&
							session.start.getTime() === oldSession.start.getTime() &&
							session.end.getTime() === oldSession.end.getTime()) 
						) {
							console.log("Found session to update: ", session);
							
							session.day = newSession.day;
							session.start = newSession.start;
							session.end = newSession.end;
							session.save();
						}
					});
					event.save();
					console.log("Updated session  to ", event.sessions);
					return JSON.stringify(newSession);
				}
			)
			.get(
				"/api/session/delete_session",
				async ({ query }) => {
					const sectionNRC = query.nrc;
					const dayToDelete = query.day;
					const startToDelete = query.start;
					const endToDelete = query.end;

					if (
						dayToDelete === undefined ||
						startToDelete === undefined ||
						endToDelete === undefined ||
						sectionNRC === undefined
					) {
						console.error(
							"DELETE_SESSION ERROR: an item is undefined ",
							query,
						);
						return undefined;
					}
					const toDeleteSession = {
						day: Number.parseInt(dayToDelete),
						start: new Date(Number.parseInt(startToDelete)),
						end: new Date(Number.parseInt(endToDelete)),
					};

					const section = await db.sectionModel.findOne({ nrc: sectionNRC });
					if (section === undefined || section === null) {
						console.log(
							"DELETE_SECSION ERROR: no section has nrc ",
							sectionNRC,
						);
						return undefined;
					}
					let found = false;

					// biome-ignore lint/complexity/noForEach: <explanation>
					section.sessions.forEach((session) => {
						if (
							session.day === toDeleteSession.day &&
							session.start.getTime() === toDeleteSession.start.getTime() &&
							session.end.getTime() === toDeleteSession.end.getTime()
						) {
							session.deleteOne();
							found = true;
						}
					});
					
					if (found === false) {
						console.log(
							"DELETE_SESSION ERROR: Could not find session to delete",
						);
						return undefined;
					}
					section.save();
					return JSON.stringify(found);
				},
				{
					query: t.Object({
						day: t.String(),
						start: t.String(),
						end: t.String(),
						nrc: t.String(),
					}),
				},
			)
			.get(
				"/api/session/delete_session_from_event",
				async ({ query }) => {
					const eventName = query.name;
					const dayToDelete = query.day;
					const startToDelete = query.start;
					const endToDelete = query.end;

					if (
						dayToDelete === undefined ||
						startToDelete === undefined ||
						endToDelete === undefined ||
						eventName === undefined
					) {
						console.error(
							"DELETE_SESSION ERROR: an item is undefined ",
							query,
						);
						return undefined;
					}
					const toDeleteSession = {
						day: Number.parseInt(dayToDelete),
						start: new Date(Number.parseInt(startToDelete)),
						end: new Date(Number.parseInt(endToDelete)),
					};

					const event = await db.eventModel.findOne({ name: eventName });
					if (event === undefined || event === null) {
						console.log(
							"DELETE_SECSION ERROR: no event has name ",
							eventName,
						);
						return undefined;
					}
					let found = false;

					// biome-ignore lint/complexity/noForEach: <explanation>
					event.sessions.forEach((session) => {
						if (
							session.day === toDeleteSession.day &&
							session.start.getTime() === toDeleteSession.start.getTime() &&
							session.end.getTime() === toDeleteSession.end.getTime()
						) {
							session.deleteOne();
							found = true;
						}
					});
					
					if (found === false) {
						console.log(
							"DELETE_SESSION ERROR: Could not find session to delete",
						);
						return undefined;
					}
					event.save();
					return JSON.stringify(found);
				},
				{
					query: t.Object({
						day: t.String(),
						start: t.String(),
						end: t.String(),
						name: t.String(),
					}),
				},
			);

