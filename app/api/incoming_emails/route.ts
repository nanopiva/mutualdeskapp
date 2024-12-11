import { MailtrapClient } from "mailtrap";

export async function POST(req: Request) {
  const { name, email, message, subject } = await req.json();
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !validateEmail(email) || !message) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const TOKEN: string = process.env.MAILTRAP_TOKEN ?? "TOKEN_NOT_FOUND";

  const client = new MailtrapClient({
    token: TOKEN,
  });

  const sender = {
    email: "hello@demomailtrap.com",
    name: "Contact form entry",
  };
  const recipients = [
    {
      email: "mutualdesk@yahoo.com",
    },
  ];

  try {
    await client.send({
      from: sender,
      to: recipients,
      subject: `Contact Form entry from: ${name} - ${email} SUBJECT: ${subject}`,
      text: `${message}`,
    });
    return new Response(null, {
      status: 201,
      headers: {
        "Content-Security-Policy": "default-src 'self';",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Unknown error" }),
      {
        status: 501,
        headers: {
          "Content-Type": "application/json",
          "Content-Security-Policy": "default-src 'self';",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "no-referrer",
        },
      }
    );
  }
}
