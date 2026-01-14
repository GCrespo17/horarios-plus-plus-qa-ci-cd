import mongoose from "mongoose";
import Elysia, { t } from "elysia";
import type { DBStarter } from "./../controllers/db";

export const pluginSubject = <T extends string>(
	config: { prefix: T },
	db: DBStarter,
) =>
	new Elysia({
		name: "userRoutes",
		seed: config,
	})
		.get("/api/subjects/get_subject_from_nrc", async ({ query }) => {
			const subject_list = await db.subjectModel
				.find({}).populate("sections").exec();
				console.log("subject_list", subject_list);
				for (const subject of subject_list) {
					for (const section of subject.sections) {
						if (section.nrc === query.nrc) {
							return JSON.stringify(subject);
						}
					}
					
				}
		},{
			query: t.Object({
				nrc: t.String(),
			}),
		})
		.get("/api/subjects/get_subjects", async ({ query }) => {
			const subject_list = await db.subjectModel
				.find({})
				// .populate("sections")
				// .exec();
			return subject_list;
		})
		.get(
			"/api/subjects/create_subject",
			async ({ query }) => {

				let saved = false;

				if (query.name === undefined) {
					console.log("Could not create subject, NAME is undefined");
					return undefined;
				}

				const newSubject = new db.subjectModel({
					name: query.name,
					sections: [],
					careers: [],
				});
				try {
					await newSubject.save();
					saved = true;
				} catch (e) {
					console.error("Failed saving subject ", e);
					return undefined;
				}
				if (saved) {
					return JSON.stringify(newSubject);
				}
			},
			{
				query: t.Object({
					name: t.String(),
				}),
			},
		)
		.get(
			"/api/subjects/get_subjects_from_id",
			async ({ query }) => {
				if (query.id === undefined) {
					return undefined;
				}

				const subject = await db.subjectModel.findById(query.id);
				if (subject === undefined) {
					return undefined;
				}

				return JSON.stringify(subject);
			},
			{
				query: t.Object({
					id: t.String(),
				}),
			},
		)
		.get("/api/subjects/delete_subject", async ({query}) => {
			if (query.subject === undefined) {
				console.log("Could not delete subject, SUBJECT is undefined");
				return undefined
			}
			
			const subject = await db.subjectModel.findOne({ name: query.subjectName });
			if (subject === null) {
				console.log(`No se encontro ${query.subjectName}`);
				return undefined
			}
			const sectionsIds = subject.sections.map((section) => section._id);
			// Delete all sections
			sectionsIds.forEach(async (sectionId) => {
				const section = await db.sectionModel.findById(sectionId);
				if (section === null) {
					console.log(`No se encontro ${sectionId}`);
					return;
				}
				try {
					await section.deleteOne();
					console.log("Deleted section successfully");
				} catch (e) {
					console.error("Failed deleting section ", e);
					return;
				}})

			try {
				await subject.deleteOne();
				return {message: "Subject deleted successfully"};
			} catch (e) {
				console.error("Failed deleting subject ", e);
				return undefined
			}
		})
		.get("/api/subjects/update_subject", async ( {query}) => {
			const oldName = query.oldname;
			const newName = query.newname;
			if (oldName === undefined) {
				console.log("Could not update subject, OLDNAME is undefined");
				return undefined
			}
			if (newName === undefined) {
				console.log("Could not update subject, NEWNAME is undefined");
				return undefined
			}


			const filter = { name: oldName };
			const newSubject = {name: newName};
			const oldSubject = await db.subjectModel.findOneAndUpdate(filter, newSubject);
			if (oldSubject === undefined) {
				console.log("Could not find and update oldName: ", oldName);
				return JSON.stringify(oldSubject);
			}
			console.log("Updated subject ", oldSubject, " to ", newSubject);
			return JSON.stringify(newSubject);

		});


