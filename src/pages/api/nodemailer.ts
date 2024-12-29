import { google } from "googleapis";
import { createTransport } from "nodemailer";
import type { Options } from "nodemailer/lib/mailer";
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
	const oauth2Client = new OAuth2(
		import.meta.env.SECRET_GCOULD_CLIENTID,
		import.meta.env.SECRET_GCLOUD_CLIENT_SECRET,
		"https://developers.google.com/oauthplayground",
	);

	oauth2Client.setCredentials({
		refresh_token: import.meta.env.SECRET_GCLOUD_REFRESH_TOKEN,
	});

	const accessToken = await new Promise((resolve, reject) => {
		oauth2Client.getAccessToken((err, token) => {
			if (err) {
				reject("Failed to create access token :(");
			}
			resolve(token);
		});
	});

	const transporter = createTransport({
		//! This works, some TS thing in nodemailer
		//@ts-ignore
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: import.meta.env.SECRET_GCLOUD_MAIL_USERNAME,
			accessToken,
			clientId: import.meta.env.SECRET_GCOULD_CLIENTID,
			clientSecret: import.meta.env.SECRET_GCLOUD_CLIENT_SECRET,
			refreshToken: import.meta.env.SECRET_GCLOUD_REFRESH_TOKEN,
		},
	});

	return transporter;
};

const sendEmail = async (emailOptions: Options) => {
	let emailTransporter = await createTransporter();
	const response = emailTransporter
		.sendMail(emailOptions)
		.then((response: any) => {
			return new Response(JSON.stringify({ response: "Message Sent" }), {
				status: 200,
			});
		})
		.catch((error: any) => {
			return new Response(JSON.stringify(error), { status: 500 });
		});

	return response;
};

//@ts-ignore
export const POST: APIRoute = async ({ request }) => {
	const data = await request.formData();

	const fullName = `${data.get("fullName")}`;
	const email = data.get("email");
	const budget = data.get("budget");
	const projectType = data.get("projectType");
	const projectDescription = data.get("projectDescription");

	if (!fullName || !email || !budget || !projectType || !projectDescription) {
		return new Response(
			JSON.stringify({
				message: "Missing required fields",
			}),
			{ status: 400 },
		);
	}

	const emailResponse = await sendEmail({
		subject: `Portfolio New Form - ${fullName}`,
		text: `A new form has been submitted by ${fullName}. 
      Email: ${email}
      Budget: ${budget}
      Project Type: ${projectType}
      Project Description: ${projectDescription}`,
		to: "john@johncwaters.com",
		from: import.meta.env.SECRET_GCLOUD_MAIL_USERNAME,
	});

	// Check if the emailResponse indicates success, and adjust accordingly
	if (!emailResponse.ok) {
		return new Response(
			JSON.stringify({
				message: "Failed to send email.",
			}),
			{ status: 500 },
		);
	}

	return new Response(
		JSON.stringify({
			message: "Email sent successfully.",
		}),
		{ status: 200 },
	);
};
