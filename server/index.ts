import "dotenv/config";
import { Server } from "@hocuspocus/server";
import { Database } from "@hocuspocus/extension-database";
import prisma from "@/lib/prisma";

const server = new Server({
  port: 1234,
  extensions: [
    new Database({
      // 1. Fetch the document from the database when the first user joins
      fetch: async ({ documentName }) => {
        const doc = await prisma.yjsDocument.findUnique({
          where: { name: documentName },
        });

        // Hocuspocus expects a Buffer/Uint8Array or null
        return doc?.data ?? null;
      },

      // 2. Save the document to the database
      store: async ({ documentName, state }) => {
        const dataBuffer = Buffer.from(state);

        await prisma.yjsDocument.upsert({
          where: { name: documentName },
          update: { data: dataBuffer },
          create: { name: documentName, data: dataBuffer },
        });
      },
    }),
  ],
});

server.listen();

console.log("Hocuspocus running on ws://localhost:1234");
