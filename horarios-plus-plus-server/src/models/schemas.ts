/* import mongoose from "mongoose";
import type { iSession, iSection, iSubject, iUser, iCareer } from "./classes";

const sessionSchema = new mongoose.Schema<iSession>({
	start: { type: Date, required: true },
	end: { type: Date, required: true },
	day: { type: Number, default: new Date().getDay() },
});

const SessionModel = mongoose.model("Session", sessionSchema);
type TSessionSchema = mongoose.InferSchemaType<typeof sessionSchema>;

interface iSectionSchema extends iSection {
	subject: mongoose.Types.ObjectId;
}

const sectionSchema = new mongoose.Schema<iSectionSchema>({
	nrc: { type: Number, required: true, unique: true },
	teacher: { type: String, required: true },
	sessions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Session",
			required: true,
		},
	],
	subject: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Subject",
		required: true,
	},
});

const SectionModel = mongoose.model<iSectionSchema>("Section", sectionSchema);
type TSectionSchema = mongoose.InferSchemaType<typeof sectionSchema>;

interface iSubjectSchema extends iSubject {
	sections: mongoose.Types.ObjectId[];
	career: mongoose.Types.ObjectId;
}

const subjectSchema = new mongoose.Schema<iSubjectSchema>({
	name: { type: String, required: true },
	sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
	career: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Career",
		required: false,
	},
});

const SubjectModel = mongoose.model("Subject", subjectSchema);
type TSubjectSchema = mongoose.InferSchemaType<typeof subjectSchema>;

interface iCareerSchema extends iCareer {
	subjects: mongoose.Types.ObjectId[];
}

const careerSchema = new mongoose.Schema<iCareerSchema>({
	name: { type: String, required: true },
	subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
});

const CareerModel = mongoose.model("Career", careerSchema);
type TCareerSchema = mongoose.InferSchemaType<typeof careerSchema>;

type THydratedUserDocument = mongoose.HydratedDocument<
	iUser,
	{
		email: string;
		password: string;
		tipo: number;
		schedule: mongoose.Types.DocumentArray<iSectionSchema>;
	}
>;
// biome-ignore lint/complexity/noBannedTypes: <explanation>
type UserModelType = mongoose.Model<iUser, {}, {}, {}, THydratedUserDocument>;

// 2. Create a Schema corresponding to the document interface.
const userSchema = new mongoose.Schema<iUser, UserModelType>({
	email: { type: String, required: true },
	password: { type: String, required: true },
	tipo: { type: Number, default: 0 },
	schedule: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
});

// 3. Create a Model.
const UserModel = mongoose.model<iUser, THydratedUserDocument>(
	"User",
	userSchema,
);
type TUserSchema = mongoose.InferSchemaType<typeof userSchema>;

export { SessionModel, CareerModel, SubjectModel, SectionModel, UserModel };
export type {
	TSessionSchema,
	TCareerSchema,
	TSubjectSchema,
	TSectionSchema,
	TUserSchema,
};
 */