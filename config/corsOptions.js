const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

export const corsOptions = {
  origin: (origin, callback) => {
    // Build allowlist from env + defaults
    const envList = process.env.CLIENT_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) || [];
    const allowlist = [...new Set([...defaultOrigins, ...envList])];

    // Allow server-to-server / Postman (no origin)
    if (!origin) return callback(null, true);

    if (allowlist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};
