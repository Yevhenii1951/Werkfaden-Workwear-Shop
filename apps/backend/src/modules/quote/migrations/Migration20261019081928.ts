import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261019081928 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "quote_request" ("id" text not null, "customer_id" text null, "access_token_hash" text not null, "contact_name" text not null, "contact_email" text not null, "company" text null, "comment" text null, "status" text check ("status" in ('draft', 'submitted', 'quoted', 'accepted', 'rejected', 'closed')) not null default 'submitted', "currency_code" text not null, "offered_total_minor" integer null, "promotion_code" text null, "quoted_at" timestamptz null, "accepted_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quote_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_quote_request_deleted_at" ON "quote_request" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "quote_request_item" ("id" text not null, "quote_request_id" text not null, "product_id" text not null, "variant_id" text not null, "title" text not null, "quantity" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quote_request_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_quote_request_item_quote_request_id" ON "quote_request_item" ("quote_request_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_quote_request_item_deleted_at" ON "quote_request_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "quote_request_item" add constraint "quote_request_item_quote_request_id_foreign" foreign key ("quote_request_id") references "quote_request" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "quote_request_item" drop constraint if exists "quote_request_item_quote_request_id_foreign";`);

    this.addSql(`drop table if exists "quote_request" cascade;`);

    this.addSql(`drop table if exists "quote_request_item" cascade;`);
  }

}
