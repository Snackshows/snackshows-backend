const nodemailer_config = {
	host: process.env.NODEMAILER_HOST,
	port:
		process.env.NODEMAILER_PORT === undefined
			? process.env.NODEMAILER_PORT
			: 465,
	secure: true,
	auth: {
		user: process.env.NODEMAILER_USER,
		password: process.env.NODEMAILER_PASSWORD,
	},

	senderFrom: process.env.NODEMAILER_SENDER_FROM,
};

// console.log("nodemailer_config", nodemailer_config);

export default nodemailer_config;
