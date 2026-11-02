CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

INSERT INTO "Category" ("name")
SELECT DISTINCT "category"
FROM "Flower"
WHERE "category" IS NOT NULL;

ALTER TABLE "Flower" ADD COLUMN "categoryId" INTEGER;

UPDATE "Flower"
SET "categoryId" = "Category"."id"
FROM "Category"
WHERE "Flower"."category" = "Category"."name";

ALTER TABLE "Flower" DROP COLUMN "category";

ALTER TABLE "Flower"
ADD CONSTRAINT "Flower_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
