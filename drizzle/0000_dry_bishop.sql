CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('waiting', 'playing', 'finished');--> statement-breakpoint
CREATE TABLE "gameSessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"roomId" integer,
	"userId" integer,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"endedAt" timestamp,
	"finalScore" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playerAnswers" (
	"id" serial PRIMARY KEY NOT NULL,
	"gameSessionId" integer NOT NULL,
	"questionId" integer NOT NULL,
	"selectedAnswer" varchar(255) NOT NULL,
	"isCorrect" integer DEFAULT 0 NOT NULL,
	"pointsEarned" integer DEFAULT 0 NOT NULL,
	"timeToAnswer" integer DEFAULT 0 NOT NULL,
	"answeredAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"createdBy" integer NOT NULL,
	"roomId" integer,
	"questionText" text NOT NULL,
	"correctAnswer" varchar(255) NOT NULL,
	"wrongAnswer1" varchar(255) NOT NULL,
	"wrongAnswer2" varchar(255) NOT NULL,
	"wrongAnswer3" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roomMembers" (
	"id" serial PRIMARY KEY NOT NULL,
	"roomId" integer NOT NULL,
	"userId" integer NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"ownerId" integer NOT NULL,
	"status" "status" DEFAULT 'waiting' NOT NULL,
	"currentQuestionIndex" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "gameSessions" ADD CONSTRAINT "gameSessions_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gameSessions" ADD CONSTRAINT "gameSessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerAnswers" ADD CONSTRAINT "playerAnswers_gameSessionId_gameSessions_id_fk" FOREIGN KEY ("gameSessionId") REFERENCES "public"."gameSessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playerAnswers" ADD CONSTRAINT "playerAnswers_questionId_questions_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roomMembers" ADD CONSTRAINT "roomMembers_roomId_rooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roomMembers" ADD CONSTRAINT "roomMembers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;