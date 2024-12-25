import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1732608562214 implements MigrationInterface {
    name = 'Migration1732608562214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscription_plans" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "stripePriceId" character varying NOT NULL, "name" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "interval" character varying NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT false, "trialDays" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shop" ADD "categoryId" integer`);
        await queryRunner.query(`ALTER TABLE "shop" ADD "activeSubscriptionPlanId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "categoryId" integer`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_f0d159b548e76fba75dc5c4f437" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_32b62899ba279cb0bc846fbe307" FOREIGN KEY ("activeSubscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_4dd13cf5536c5ec906dba37cbef" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_4dd13cf5536c5ec906dba37cbef"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_32b62899ba279cb0bc846fbe307"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_f0d159b548e76fba75dc5c4f437"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP COLUMN "activeSubscriptionPlanId"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP COLUMN "categoryId"`);
        await queryRunner.query(`DROP TABLE "subscription_plans"`);
    }

}
