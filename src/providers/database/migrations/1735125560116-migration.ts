import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1735125560116 implements MigrationInterface {
    name = 'Migration1735125560116'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api_request" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "path" character varying NOT NULL, "method" character varying NOT NULL, "status" integer NOT NULL, "body" character varying, "headers" character varying NOT NULL, "userId" character varying, "message" character varying, "ip" character varying, CONSTRAINT "PK_b3d35215ae13b22c62e9e4bb05b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_token" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "token" character varying NOT NULL, "isShop" boolean NOT NULL DEFAULT false, "userId" character varying, CONSTRAINT "PK_99cf05a96c3aaf7dfd10b5740d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "redeemed_deal" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "couponCode" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending_usage', "dealId" integer NOT NULL, "userId" character varying NOT NULL, "used" boolean NOT NULL DEFAULT false, "usedAt" TIMESTAMP, "socialMediaLink" character varying, "image" character varying, "additionalInfo" character varying, "approved" boolean, "approvedAt" TIMESTAMP, "approvedById" character varying, CONSTRAINT "UQ_789dea58f5a8710ec24cadbe07e" UNIQUE ("couponCode"), CONSTRAINT "PK_010f04ca624585fe0c544e33c8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deal" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "images" text NOT NULL, "video" character varying, "title" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'deal', "description" text NOT NULL DEFAULT '', "features" text NOT NULL DEFAULT '', "keywords" character varying NOT NULL, "availableUntil" date, "shortTagLine" character varying, "maxPurchaseLimit" integer DEFAULT '0', "maxPurchasePerUser" integer DEFAULT '0', "categoryId" integer NOT NULL, "shopId" integer NOT NULL, CONSTRAINT "PK_9ce1c24acace60f6d7dc7a7189e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_00d309231b498451a5598fdf6e" ON "deal" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_ea4751d70087395db8f2143022" ON "deal" ("description") `);
        await queryRunner.query(`CREATE INDEX "IDX_e5bd56675a97a92c74f1eb4ad8" ON "deal" ("keywords") `);
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying NOT NULL, "image" character varying NOT NULL, "parentId" integer, CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscription_plans" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "stripePriceId" character varying NOT NULL, "name" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "interval" character varying NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT false, "trialDays" integer NOT NULL DEFAULT '0', "maxDeals" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shop" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "email" character varying, "description" character varying, "logo" character varying, "backgroundArt" character varying, "address" character varying, "approved" boolean NOT NULL DEFAULT false, "subscriptionState" character varying, "subscriptionEndAt" TIMESTAMP, "categoryId" integer, "ownerId" character varying NOT NULL, "activeSubscriptionPlanId" integer, CONSTRAINT "REL_28fb7269a26c4e112e151e46f5" UNIQUE ("ownerId"), CONSTRAINT "PK_ad47b7c6121fe31cb4b05438e44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum" AS ENUM('Male', 'Female', 'Prefer not to say')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'shopowner', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "approved" boolean NOT NULL DEFAULT false, "name" character varying, "photo" character varying, "phone" character varying, "email" character varying, "birthDate" TIMESTAMP, "gender" "public"."user_gender_enum", "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "facebookProfileLink" character varying, "instagramProfileLink" character varying, "tiktokProfileLink" character varying, "twitterProfileLink" character varying, "youtubeProfileLink" character varying, "linkedinProfileLink" character varying, "categoryId" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "related_categories" ("category_id" integer NOT NULL, "related_category_id" integer NOT NULL, CONSTRAINT "PK_4801f959f78f209fdfe87fc4339" PRIMARY KEY ("category_id", "related_category_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_abb9b019c70a1e1baae63b6df4" ON "related_categories" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c469a8b20f2cc9a831223780e1" ON "related_categories" ("related_category_id") `);
        await queryRunner.query(`ALTER TABLE "notification_token" ADD CONSTRAINT "FK_8c1dede7ba7256bff4e6155093c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeemed_deal" ADD CONSTRAINT "FK_9297667272286d7c70f2fbb3657" FOREIGN KEY ("dealId") REFERENCES "deal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeemed_deal" ADD CONSTRAINT "FK_9526ff5b82413c87b04a6cd9308" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "redeemed_deal" ADD CONSTRAINT "FK_895fa8d96b5a18d7aea7ec9ab50" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deal" ADD CONSTRAINT "FK_64acad740a0fe6c5b682d619329" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deal" ADD CONSTRAINT "FK_f59ef26c5f408999a1a3962e7ba" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_f0d159b548e76fba75dc5c4f437" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_28fb7269a26c4e112e151e46f50" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_32b62899ba279cb0bc846fbe307" FOREIGN KEY ("activeSubscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_4dd13cf5536c5ec906dba37cbef" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "related_categories" ADD CONSTRAINT "FK_abb9b019c70a1e1baae63b6df4c" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "related_categories" ADD CONSTRAINT "FK_c469a8b20f2cc9a831223780e12" FOREIGN KEY ("related_category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "related_categories" DROP CONSTRAINT "FK_c469a8b20f2cc9a831223780e12"`);
        await queryRunner.query(`ALTER TABLE "related_categories" DROP CONSTRAINT "FK_abb9b019c70a1e1baae63b6df4c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_4dd13cf5536c5ec906dba37cbef"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_32b62899ba279cb0bc846fbe307"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_28fb7269a26c4e112e151e46f50"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_f0d159b548e76fba75dc5c4f437"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"`);
        await queryRunner.query(`ALTER TABLE "deal" DROP CONSTRAINT "FK_f59ef26c5f408999a1a3962e7ba"`);
        await queryRunner.query(`ALTER TABLE "deal" DROP CONSTRAINT "FK_64acad740a0fe6c5b682d619329"`);
        await queryRunner.query(`ALTER TABLE "redeemed_deal" DROP CONSTRAINT "FK_895fa8d96b5a18d7aea7ec9ab50"`);
        await queryRunner.query(`ALTER TABLE "redeemed_deal" DROP CONSTRAINT "FK_9526ff5b82413c87b04a6cd9308"`);
        await queryRunner.query(`ALTER TABLE "redeemed_deal" DROP CONSTRAINT "FK_9297667272286d7c70f2fbb3657"`);
        await queryRunner.query(`ALTER TABLE "notification_token" DROP CONSTRAINT "FK_8c1dede7ba7256bff4e6155093c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c469a8b20f2cc9a831223780e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_abb9b019c70a1e1baae63b6df4"`);
        await queryRunner.query(`DROP TABLE "related_categories"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum"`);
        await queryRunner.query(`DROP TABLE "shop"`);
        await queryRunner.query(`DROP TABLE "subscription_plans"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5bd56675a97a92c74f1eb4ad8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea4751d70087395db8f2143022"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_00d309231b498451a5598fdf6e"`);
        await queryRunner.query(`DROP TABLE "deal"`);
        await queryRunner.query(`DROP TABLE "redeemed_deal"`);
        await queryRunner.query(`DROP TABLE "notification_token"`);
        await queryRunner.query(`DROP TABLE "api_request"`);
    }

}
