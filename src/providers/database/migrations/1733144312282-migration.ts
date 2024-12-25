import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1733144312282 implements MigrationInterface {
    name = 'Migration1733144312282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "deal" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "images" text NOT NULL, "video" character varying, "title" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'deal', "description" text NOT NULL DEFAULT '', "features" text NOT NULL DEFAULT '', "keywords" character varying NOT NULL, "availableUntil" date, "shortTagLine" character varying, "maxPurchaseLimit" integer NOT NULL DEFAULT '0', "maxPurchasePerUser" integer NOT NULL DEFAULT '0', "categoryId" integer, "shopId" integer NOT NULL, CONSTRAINT "PK_9ce1c24acace60f6d7dc7a7189e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_00d309231b498451a5598fdf6e" ON "deal" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_ea4751d70087395db8f2143022" ON "deal" ("description") `);
        await queryRunner.query(`CREATE INDEX "IDX_e5bd56675a97a92c74f1eb4ad8" ON "deal" ("keywords") `);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripeId"`);
        await queryRunner.query(`ALTER TABLE "deal" ADD CONSTRAINT "FK_64acad740a0fe6c5b682d619329" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deal" ADD CONSTRAINT "FK_f59ef26c5f408999a1a3962e7ba" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deal" DROP CONSTRAINT "FK_f59ef26c5f408999a1a3962e7ba"`);
        await queryRunner.query(`ALTER TABLE "deal" DROP CONSTRAINT "FK_64acad740a0fe6c5b682d619329"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "stripeId" character varying`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5bd56675a97a92c74f1eb4ad8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea4751d70087395db8f2143022"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_00d309231b498451a5598fdf6e"`);
        await queryRunner.query(`DROP TABLE "deal"`);
    }

}
