import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1732340897135 implements MigrationInterface {
    name = 'Migration1732340897135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying NOT NULL, "image" character varying NOT NULL, "parentId" integer, CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "related_categories" ("category_id" integer NOT NULL, "related_category_id" integer NOT NULL, CONSTRAINT "PK_4801f959f78f209fdfe87fc4339" PRIMARY KEY ("category_id", "related_category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_abb9b019c70a1e1baae63b6df4" ON "related_categories" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c469a8b20f2cc9a831223780e1" ON "related_categories" ("related_category_id") `);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "related_categories" ADD CONSTRAINT "FK_abb9b019c70a1e1baae63b6df4c" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "related_categories" ADD CONSTRAINT "FK_c469a8b20f2cc9a831223780e12" FOREIGN KEY ("related_category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "related_categories" DROP CONSTRAINT "FK_c469a8b20f2cc9a831223780e12"`);
        await queryRunner.query(`ALTER TABLE "related_categories" DROP CONSTRAINT "FK_abb9b019c70a1e1baae63b6df4c"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c469a8b20f2cc9a831223780e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_abb9b019c70a1e1baae63b6df4"`);
        await queryRunner.query(`DROP TABLE "related_categories"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }

}
