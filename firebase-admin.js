// firebase-admin.js - ES Module para Railway
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  // Configuração usando variáveis de ambiente do Railway
  const serviceAccountConfig = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID || "canal-vivo-chat",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountConfig),
    projectId: process.env.FIREBASE_PROJECT_ID || "canal-vivo-chat",
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

// Funções para sistema de usuários e pagamentos
export async function verifyUser(token) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Erro verificação usuário:", error);
    return null;
  }
}

export async function checkUserPayment(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.exists ? userDoc.data() : null;
  } catch (error) {
    console.error("Erro verificação pagamento:", error);
    return null;
  }
}

export async function logGPTUsage(userId, prompt, response, model) {
  try {
    await db.collection("gpt_logs").add({
      userId,
      prompt,
      response,
      model,
      timestamp: new Date(),
      cost: calculateCost(model, prompt, response)
    });
  } catch (error) {
    console.error("Erro log GPT:", error);
  }
}

function calculateCost(model, prompt, response) {
  // Calcular custo baseado no modelo e tokens
  const tokens = (prompt.length + response.length) / 4; // Estimativa
  return tokens * 0.0001; // Custo por token
}