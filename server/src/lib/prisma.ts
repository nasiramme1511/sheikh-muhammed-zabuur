import { PrismaClient } from '@prisma/client';

let databaseUrl = process.env.DATABASE_URL;

if (databaseUrl && databaseUrl.includes('tidbcloud.com')) {
  try {
    const urlObj = new URL(databaseUrl);
    if (!urlObj.searchParams.has('sslaccept')) {
      urlObj.searchParams.set('sslaccept', 'accept_invalid_certs');
      databaseUrl = urlObj.toString();
    }
  } catch (err) {
    if (!databaseUrl.includes('sslaccept=')) {
      const separator = databaseUrl.includes('?') ? '&' : '?';
      databaseUrl = `${databaseUrl}${separator}sslaccept=accept_invalid_certs`;
    }
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

export default prisma;
