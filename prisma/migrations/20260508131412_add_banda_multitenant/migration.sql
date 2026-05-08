-- AlterEnum
ALTER TYPE "TipoUsuario" ADD VALUE 'super_admin';

-- AlterTable
ALTER TABLE "Artista" ADD COLUMN     "bandaId" INTEGER;

-- AlterTable
ALTER TABLE "Contratante" ADD COLUMN     "bandaId" INTEGER;

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "bandaId" INTEGER;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "bandaId" INTEGER;

-- CreateTable
CREATE TABLE "Banda" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Banda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Banda_slug_key" ON "Banda"("slug");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_bandaId_fkey" FOREIGN KEY ("bandaId") REFERENCES "Banda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artista" ADD CONSTRAINT "Artista_bandaId_fkey" FOREIGN KEY ("bandaId") REFERENCES "Banda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contratante" ADD CONSTRAINT "Contratante_bandaId_fkey" FOREIGN KEY ("bandaId") REFERENCES "Banda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_bandaId_fkey" FOREIGN KEY ("bandaId") REFERENCES "Banda"("id") ON DELETE SET NULL ON UPDATE CASCADE;
