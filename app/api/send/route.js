import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // 1. Email NEKED (a tulajdonosnak)
    // Fontos: A 'from' mező teszteléskor csak 'onboarding@resend.dev' lehet,
    // amíg nem hitelesíted a saját domainedet a Resend oldalán.
    // A 'to' mező pedig csak az az email lehet, amivel regisztráltál a Resendre (teszt módban).
    const dataOwner = await resend.emails.send({
      from: 'Csizi Varrodája <onboarding@resend.dev>',
      to: ['csizi.varroda@gmail.com'],
      subject: `Új üzenet érkezett: ${name}`,
      html: `
        <h1>Új megkeresés a weboldalról</h1>
        <p><strong>Név:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Üzenet:</strong></p>
        <p>${message}</p>
      `,
    });

    // 2. Visszaigazoló email a FELHASZNÁLÓNAKasasa
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