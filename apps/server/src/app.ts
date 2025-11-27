import * as dotenv from 'dotenv';
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
// import authRouter from './routes/auth.routes';


// import eventsRouter from "./routes/events.routes";
// import bookingRouter from "./routes/booking.routes";
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import { initializePassportStrategies } from './config/passport.config';
import { storeMiddleware } from './middleware/store.middleware';
// import { runMigrations } from './db/migrate';
// import { runMigrations } from './db/migrate';
dotenv.config();

const app: Application = express();

// // Run migrations before starting the server
// (async () => {
// 	await runMigrations();

// 	// Now start your app (e.g., Express/Next.js/etc)
// 	console.log('🚀 Starting server...');
// })();

const corsOptions = {
	origin: [process.env.FRONTEND_ENDPOINT_URL!],
	optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization', 'x-store-id', 'X-Store-ID'],
	exposedHeaders: ['x-store-id', 'X-Store-ID'],
	// If cookies or credentials are used
};
app.use(cors(corsOptions));
app.use(cookieParser());
//accept JSON data
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

///Passport for Authentication
app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false, httpOnly: true, maxAge: 12000000 },
	})
);
initializePassportStrategies();
app.use(passport.initialize());
app.use(passport.session());
app.enable('trust proxy');

// Custom middleware to extract storeId
// app.use(storeMiddleware);

// app.use('/api/v1/webhooks', webhooksRouter);

app.use(express.json({ limit: '20kb' }));
// Routes Declaration
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/role', roleRouter);
// app.use('/api/v1/user', userRouter);
// app.use('/api/v1/customer', customerRouter);
// app.use('/api/v1/cart', cartRouter);
// app.use('/api/v1/store', storeRouter);
// app.use('/api/v1/products', storeMiddleware, productRouter);
// app.use('/api/v1/inventory', inventoryRouter);
// app.use('/api/v1/collections', collectionRouter);
// app.use('/api/v1/category', categoryRouter);
// app.use('/api/v1/orders', orderRouter);
// app.use('/api/v1/media', mediaRouter);
// app.use('/api/v1/payment', paymentRouter);
// app.use('/api/v1/settings', settingsRouter);
// app.use('/api/v1/subscription', subscriptionRouter);

app.get('/', async (req, res) => {
	res.json({ message: 'Server is 100% up running' });
});

export default app;
