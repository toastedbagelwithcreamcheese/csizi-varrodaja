import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req) {
  try {
    // 1. BEHÚZTUK IDE BELÜLRE A RESEND PÉLDÁNYOSÍTÁST!
    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await req.json();
    const { name, email, message } = body;

    // 2. Email NEKED (a tulajdonosnak)
    const dataOwner = await resend.emails.send({
      from: 'Csizi Varrodája <onboarding@resend.dev>',
      to: ['csizi.varroda@gmail.com'], // Ide a sajátod megy
      subject: `Új üzenet érkezett: ${name}`,
      html: `
        <h1>Új megkeresés a weboldalról</h1>
        <p><strong>Név:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Üzenet:</strong></p>
        <p>${message}</p>
      `,
    });

    // 3. Visszaigazoló email a FELHASZNÁLÓNAK
    await resend.emails.send({
      from: 'Csizi Varrodája <onboarding@resend.dev>',
      to: [email],
      subject: 'Köszönjük megkeresését!',
      html: `
        <h1>Kedves ${name}!</h1>
        <p>Köszönjük, hogy írt nekünk. Megkaptuk üzenetét, és hamarosan felvesszük Önnel a kapcsolatot.</p>
        <hr />
        <p>Üdvözlettel,<br/>Csizi Varrodája</p>
      `,
    });

    return NextResponse.json({ success: true, data: dataOwner });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}