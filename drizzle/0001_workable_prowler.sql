ALTER TABLE "invite_codes" ADD COLUMN "patient_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "professionals" ADD COLUMN "name" text NOT NULL;