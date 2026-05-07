/*
  Warnings:

  - Added the required column `cidade` to the `Evento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `Evento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "contratanteId" INTEGER,
ADD COLUMN     "estado" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Contratante" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contratante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contratante_cpf_key" ON "Contratante"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Contratante_cnpj_key" ON "Contratante"("cnpj");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_contratanteId_fkey" FOREIGN KEY ("contratanteId") REFERENCES "Contratante"("id") ON DELETE SET NULL ON UPDATE CASCADE;
