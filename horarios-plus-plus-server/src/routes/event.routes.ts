import type { DBStarter } from "../controllers/db";
import Elysia, { t } from "elysia";

export const pluginEvent = <T extends string>(
	config: { prefix: T },
	db: DBStarter,
) =>
	new Elysia({
		name: "my-Event-plugin",
		seed: config,
	})
        .get(`${config.prefix}/get_events_from_id`, async ({query}) => {
            const { id } = query;
            const event = await db.eventModel.findById(id);
            return JSON.stringify(event);
        }
        )
        .get(`${config.prefix}/get_all_events`, async ({query}) => {
            console.log("get_all_events");
            
            const events = await db.eventModel.find();
            return JSON.stringify(events);
        }
        )
        .post(`${config.prefix}/create_event/`, async ({query}) => {
            const { name } = query;
            const event = new db.eventModel({
                name,
                sessions: [],
            });
            await event.save();
            return JSON.stringify(event);
        },{
            //así defines lo que pasas como body en el fetch hay que cambiar lo que tengo abajo para que parezca lo que sería el evento
            query: t.Object({
                name: t.String(),
            }),
        }
        )
        .put("/api/add_session_to_event",async({query,body})=>{
            const name:string=query.name
            const day=body.day;
            const start=body.start;
            const end=body.end;

            const eventos=await db.eventModel.find({name:name})
            for (const evento of eventos) {
                if (evento.sessions!==null || evento.sessions!==undefined ) {
                    evento.sessions.push(new db.sessionModel({
                        day:day,
                        start:start,
                        end:end
                    }
                    ))
                }
            }
            return("creado")
        },{
            body: t.Object({
                day: t.Number(),
                start: t.Date(),
                end: t.Date()

            }),
            query: t.Object({
                name:t.String()
            })
        })
        .put(`${config.prefix}/update_event`, async ( {query}) => {
			const oldName = query.oldname;
			const newName = query.newname;
			if (oldName === undefined) {
				console.log("Could not update event, OLDNAME is undefined");
				return undefined
			}
			if (newName === undefined) {
				console.log("Could not update event, NEWNAME is undefined");
				return undefined
			}


			const filter = { name: oldName };
			const newEvent = {name: newName};
			const oldEvent = await db.eventModel.findOneAndUpdate(filter, newEvent);
			if (oldEvent === undefined) {
				console.log("Could not find and update oldName: ", oldName);
				return JSON.stringify(oldEvent);
			}
			console.log("Updated event ", oldEvent, " to ", newEvent);
			return JSON.stringify(newEvent);

		})
        .delete(`${config.prefix}/delete_event`,async({query})=>{
            const name=query.eventName
            console.log(name);
            
            try {
                
                const aMatar=await db.eventModel.findOneAndDelete({name:name})
                console.log(aMatar);
				return {message: "Event deleted successfully"};
			} catch (e) {
				console.error("Failed deleting Event ", e);
				return undefined
			}

        },{
            query: t.Object({
                eventName:t.String(),
                event:t.String()
            })
        })


