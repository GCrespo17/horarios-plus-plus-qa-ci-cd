// plugin.ts
import { Elysia } from "elysia";
import type { DBStarter } from "../controllers/db";
import { Career, Schedule, Section, Session, Subject, User } from "../models/classes";

async function instanciarTodo(materias:Array<any>, sectionsArr:Array<any>) {
	const a =new Career("Ingeniería en Computación");
	let numeroSec = 0;
	let numeroSub = 0;
	const materiasArr = [];
	let sessionsArr: Session[] = [];
	let sectionsArrTemp = [];
	for await (const materia of materias) {
		await materia.populate("sections");
		const materiaTemp=new Subject(materia.name, [], a);
		for  (const section of materia.sections) {
			sessionsArr = [];
			for  (const sección of sectionsArr) {
				if (section._id.equals(sección._id)) {
					numeroSec++;
					sección.sessions.forEach((session:any) => {
						sessionsArr.push(new Session(session.start, session.end, session.day));
					});
					sectionsArrTemp.push(new Section(sección.nrc, sección.teacher, sessionsArr, materiaTemp));
				}
			}
		}
		if (numeroSec > 0) {
			materiaTemp.sections = sectionsArrTemp;
			numeroSub++;
			materiasArr.push(materiaTemp);
		}
		sectionsArrTemp = [];
		numeroSec = 0;
	}

	if(numeroSub < 1){
		throw new Error("FAILED TO GENERATE SCHEDULES: A subject is not found");
	}
	return materiasArr;
}

export const pluginSchedule = <T extends string>(
	config: { prefix: T },
	db: DBStarter,
) =>
	new Elysia({
		name: "my-Schedule-plugin",
		seed: config,
	})
		.get("/api/schedules/generate_schedules", async ({query}) => {
			const owner = query.owner;
			const nrcs = query.nrcs;

			if (owner === undefined || nrcs === undefined) {
				console.error("FAILED TO GENERATE SCHEDULES: A value is undefined");
				return JSON.stringify(undefined);
			}

			const failed = false;
			const sections = await Promise.all(
				nrcs.split(",").map(async (nrc) => {
					return await db.sectionModel.find({ nrc: nrc });
				}),
			);
			const sectionsArr = sections.flat();
			//una busqueda en db.subjectModel para buscar el número de materias que contengan las secciones
			const materias = await db.subjectModel.find({});

			const materiasArr=await instanciarTodo(materias, sectionsArr);

			// console.error(`Numero de materias: ${numeroSub}`, `Numero de secciones: ${sectionsArr.length}`);
			// console.log("Las Materias Son\n",materiasArr,"\n");
			let schedules = new Array();
			const scheduleInicial = new Schedule(new User(owner,"algo",4,[]), []);
			console.log("Estos son las materias antes de recursivo \n",materiasArr,"\n");
			
			Schedule.recursiveSchedulePush(0, materiasArr, scheduleInicial, schedules);
			// console.log("Estos son los horarios antes de filtrador \n",schedules,"\n");
			schedules = Schedule.filtrarHorariosPorMaterias(schedules, materiasArr);
			schedules=schedules.filter((schedule) => {
				for (const section of schedule.sections) {
					if (section.sessions.length === 0) {
						return false;
					}else {
						return true;
					}
				}
			});
			console.log("\nhorarios después de filtrados\n",Bun.inspect(schedules,{colors:true,depth: 5}));
			
			// const schedules = await GenerateSchedules(sectionsArr, numeroSub);
			for (const schedule of schedules) {
				for (const section of schedule.sections) {
					section.subject.sections = [];
				}
			}

			return JSON.stringify(schedules);
		})
		.put("/api/schedules/save_schedule", async ({ query }) => {
			const owner = query.owner;
			const nrcs = query.nrcs;

			if (owner === undefined || nrcs === undefined) {
				console.error("FAILED TO SAVE SCHEDULE: A value is undefined");
				return JSON.stringify(undefined);
			}

			const nrcsArr = nrcs.split(",");


			const user = await db.userModel.findOne({ email: owner }).orFail();
			if (user === undefined || user === null) {
				console.error("FAILED TO SAVE SCHEDULE: User not found");
				return JSON.stringify(undefined);
			}
			
			const horarios=await Promise.all(nrcsArr.map(async (nrc) => {
					if (nrc !== null && nrc !==undefined) {
						const section = await db.sectionModel.findOne({ nrc: nrc });
						if (section !== null && section !== undefined) {
							return section;
						}
					}
					}
				)
			)
			if (horarios === undefined || horarios.length === 0 || horarios===null) {
				console.error("FAILED TO SAVE SCHEDULE: A section is not found");
				return JSON.stringify(undefined);
			}	
			user.schedule=horarios.map((section:any) => {
				return section._id;
			}
			);

			user.save();

			return JSON.stringify([]);
		})
		.get("/api/schedule/get_schedule_from_id", async ({ query }) => {
			if (query.id === undefined) {
				return JSON.stringify(undefined);
			}

			const schedule = await db.userModel.findById(query.id);
			if (schedule === undefined) {
				return JSON.stringify(undefined);
			}

			return JSON.stringify(schedule);
		})
		.get("/api/schedule/get_schedule_from_owner", async ({ query }) => {
			if (query.owner === undefined) {
				return JSON.stringify(undefined);
			}

			const user = await db.userModel.findOne({ email: query.owner });
			if (user === undefined || user === null) {
				return JSON.stringify(undefined);
			}

			return JSON.stringify(user.schedule);
		});



