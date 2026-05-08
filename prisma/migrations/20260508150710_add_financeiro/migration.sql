-- CreateEnum
CREATE TYPE "TipoPagamento" AS ENUM ('adiantamento', 'saldo', 'total');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('pix', 'ted', 'dinheiro', 'cheque');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('pendente', 'recebido');

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "numeroNF" TEXT;

-- CreateTable
CREATE TABLE "CategoriaDespesa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "bandaId" INTEGER,

    CONSTRAINT "CategoriaDespesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Despesa" (
    "id" SERIAL NOT NULL,
    "eventoId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "descricao" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Despesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" SERIAL NOT NULL,
    "eventoId" INTEGER NOT NULL,
    "tipo" "TipoPagamento" NOT NULL,
    "forma" "FormaPagamento" NOT NULL,
    "percentual" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "observacao" TEXT,
    "status" "StatusPagamento" NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CategoriaDespesa" ADD CONSTRAINT "CategoriaDespesa_bandaId_fkey" FOREIGN KEY ("bandaId") REFERENCES "Banda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Despesa" ADD CONSTRAINT "Despesa_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaDespesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
