import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendActivationEmail(email: string, nome: string, token: string) {
  const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/activate?token=${token}`;
  
  await transporter.sendMail({
    from: `"Pulmo Vida" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Ative sua conta - Pulmo Vida",
    html: `
      <div style="font-family: Arial, sans-serif; max-w-lg; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16201E;">Olá ${nome}, bem-vindo ao Pulmo Vida!</h2>
        <p style="color: #746F70; line-height: 1.5;">Obrigado por se registrar no nosso sistema. Para garantir a sua segurança e ativar o seu acesso, por favor clique no botão abaixo:</p>
        <div style="margin: 30px 0;">
          <a href="${activationUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ativar Minha Conta</a>
        </div>
        <p style="color: #746F70; font-size: 12px;">Se o botão não funcionar, cole o link abaixo no seu navegador:<br/>
        <a href="${activationUrl}" style="color: #3B82F6;">${activationUrl}</a></p>
        <p style="color: #746F70; font-size: 12px; margin-top: 30px;">Este link expira em 15 minutos.</p>
      </div>
    `
  });
}

export async function sendDoctorCredentialsEmail(email: string, nome: string, tempPassword: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;
  
  await transporter.sendMail({
    from: `"Pulmo Vida" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Credenciais de Acesso - Pulmo Vida",
    html: `
      <div style="font-family: Arial, sans-serif; max-w-lg; margin: 0 auto; padding: 20px; border: 1px solid #BFDBFE; border-radius: 12px; background-color: #FAFAFA;">
        <h2 style="color: #16201E;">Olá Dr(a). ${nome}, bem-vindo(a) ao Pulmo Vida!</h2>
        <p style="color: #746F70; line-height: 1.5;">O seu perfil médico foi criado pelo administrador do sistema. Aqui estão as suas credenciais temporárias de acesso:</p>
        
        <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #BFDBFE;">
          <p style="margin: 0 0 10px 0; color: #16201E;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0; color: #16201E;"><strong>Senha Temporária:</strong> <span style="font-family: monospace; font-size: 16px; letter-spacing: 1px;">${tempPassword}</span></p>
        </div>

        <p style="color: #746F70; line-height: 1.5;"><strong>Importante:</strong> Ao fazer o seu primeiro login, o sistema irá solicitar que você altere a sua senha por motivos de segurança.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${loginUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Fazer Login</a>
        </div>
      </div>
    `
  });
}
