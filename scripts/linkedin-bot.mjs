import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'bot-config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
  const min = config.minDelaySeconds * 1000;
  const max = config.maxDelaySeconds * 1000;
  const delay = Math.floor(Math.random() * (max - min + 1) + min);
  console.log(`⏳ Pause de ${Math.round(delay / 1000)} secondes pour simuler un humain...`);
  return sleep(delay);
}

function getChromePath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

async function startBot() {
  console.log("🤖 Démarrage du robot LinkedIn...");
  console.log("⚠️  NE RÉDUISEZ PAS LA FENÊTRE CHROME, LAISSEZ-LA VISIBLE !");

  const browser = await puppeteer.launch({
    headless: false, // Must be visible to pass captchas and mimic real user
    executablePath: getChromePath(), // Uses real Chrome instead of Chromium
    userDataDir: path.join(process.cwd(), 'scripts', 'chrome-profile'), // Saves your login session!
    defaultViewport: null,
    ignoreDefaultArgs: ['--enable-automation'], // Enlève la bannière "Chrome est contrôlé..."
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled' // Cache le fait que c'est un robot à Google
    ]
  });

  const page = await browser.newPage();

  console.log(`🌐 Navigation directe vers la recherche: ${config.searchUrl}`);
  await page.goto(config.searchUrl, { waitUntil: 'domcontentloaded' });
  await sleep(5000);

  // Check if LinkedIn redirected us to login
  let currentUrl = page.url();
  if (currentUrl.includes('login') || currentUrl.includes('signup') || currentUrl.includes('auth')) {
    console.log("🕒 Vous n'êtes pas connecté. Veuillez vous connecter manuellement dans la fenêtre Chrome.");
    console.log("🕒 Le robot attend que vous vous connectiez (il détectera le changement de page)...");
    
    // Wait until the URL changes from login to something else (like the search page or feed)
    try {
      await page.waitForFunction(() => !window.location.href.includes('login') && !window.location.href.includes('signup') && !window.location.href.includes('auth'), { timeout: 120000 });
      console.log("✅ Connexion réussie !");
      
      // If we ended up on the feed, go back to the search URL
      if (!page.url().includes('search')) {
        console.log("🔄 Retour à la page de recherche...");
        await page.goto(config.searchUrl, { waitUntil: 'domcontentloaded' });
        await sleep(5000);
      }
    } catch (e) {
      console.log("❌ Temps imparti (2 minutes) dépassé pour la connexion. Fermeture.");
      await browser.close();
      return;
    }
  } else {
    console.log("✅ Vous êtes déjà connecté !");
  }

  console.log("🔍 Analyse des résultats de recherche...");
  let connectionsSent = 0;

  while (connectionsSent < config.maxConnectionsPerDay) {
    // Scroll down to load all buttons
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(3000);

    // Find all buttons on the page
    const buttons = await page.$$('button');
    let clickedAny = false;
    
    console.log(`👀 ${buttons.length} boutons trouvés sur la page. Analyse en cours...`);

    for (const button of buttons) {
      if (connectionsSent >= config.maxConnectionsPerDay) break;

      // Utilisation de innerText qui est plus fidèle à ce qui est affiché à l'écran
      const text = await page.evaluate(el => (el.innerText || el.textContent || '').trim().toLowerCase(), button);
      
      // On filtre les boutons vides pour ne pas polluer la console
      if (text && (text.includes('connect') || text.includes('suivre') || text.includes('message'))) {
        console.log(`- Bouton analysé : "${text.replace(/\n/g, ' ')}"`);
      }

      // Si le bouton contient "connect" (marche pour "Connect" et "Se connecter")
      if (text.includes('connect')) {
        console.log("🎯 Bouton 'Connecter' trouvé ! Tentative de clic...");
        
        try {
          await button.click();
          await sleep(2000);

          // Check if the "Add a note" modal appeared
          const addNoteBtn = await page.$('button[aria-label="Add a note"], button[aria-label="Ajouter une note"]');
          if (addNoteBtn) {
            await addNoteBtn.click();
            await sleep(1500);

            console.log("✍️ Écriture du message...");
            await page.keyboard.type(config.messageTemplate, { delay: 30 }); // Type like a human
            await sleep(2000);

            const sendBtn = await page.$('button[aria-label="Send now"], button[aria-label="Envoyer"]');
            if (sendBtn) {
              // UNCOMMENT NEXT LINE TO ACTUALLY SEND
              // await sendBtn.click();
              console.log("✅ (MODE TEST) Message écrit, envoi simulé.");
              connectionsSent++;
              clickedAny = true;
              
              // Close modal for test mode (to continue to next)
              const closeBtn = await page.$('button[aria-label="Dismiss"], button[aria-label="Fermer"]');
              if (closeBtn) await closeBtn.click();
              
              await randomDelay();
            }
          } else {
            console.log("⚠️ Impossible de trouver le bouton 'Ajouter une note'. Annulation pour ce profil.");
            // Close modal if needed
            const closeBtn = await page.$('button[aria-label="Dismiss"], button[aria-label="Fermer"]');
            if (closeBtn) await closeBtn.click();
          }
        } catch (e) {
          console.log("⚠️ Erreur lors de l'interaction avec le profil :", e.message);
        }
      }
    }

    if (!clickedAny) {
      console.log("⏭️ Plus de cibles sur cette page, passage à la page suivante...");
      const nextBtn = await page.$('button[aria-label="Next"], button[aria-label="Suivant"]');
      if (nextBtn) {
        await nextBtn.click();
        await sleep(5000);
      } else {
        console.log("🛑 Fin des résultats de recherche.");
        break;
      }
    }
  }

  console.log(`🏁 Mission terminée ! ${connectionsSent} invitations envoyées.`);
  await browser.close();
}

startBot().catch(console.error);
