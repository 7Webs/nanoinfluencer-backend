import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1732026557745 implements MigrationInterface {
    name = 'Migration1732026557745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api_request" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "path" character varying NOT NULL, "method" character varying NOT NULL, "status" integer NOT NULL, "body" character varying, "headers" character varying NOT NULL, "userId" character varying, "message" character varying, "ip" character varying, CONSTRAINT "PK_b3d35215ae13b22c62e9e4bb05b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum" AS ENUM('Male', 'Female', 'Prefer not to say')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying, "photo" character varying, "phone" character varying, "email" character varying, "birthDate" TIMESTAMP, "stripeId" character varying, "gender" "public"."user_gender_enum", "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_token" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "token" character varying NOT NULL, "isShop" boolean NOT NULL DEFAULT false, "userId" character varying, CONSTRAINT "PK_99cf05a96c3aaf7dfd10b5740d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notification_token" ADD CONSTRAINT "FK_8c1dede7ba7256bff4e6155093c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_token" DROP CONSTRAINT "FK_8c1dede7ba7256bff4e6155093c"`);
        await queryRunner.query(`DROP TABLE "notification_token"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum"`);
        await queryRunner.query(`DROP TABLE "api_request"`);
    }

}
