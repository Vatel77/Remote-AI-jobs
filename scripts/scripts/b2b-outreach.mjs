import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\n=== B2B Email Generator for RemoteAI Jobs ===\n");

rl.question('Nom de l\'entreprise ciblée : ', (company) => {
  rl.question('Intitulé du poste (ex: Machine Learning Engineer) : ', (jobTitle) => {
    
    console.log("\n✅ Voici l'email généré à envoyer au recruteur ou au CEO :\n");
    console.log("--------------------------------------------------");
    console.log(`Objet : Your ${jobTitle} role at ${company} / Remote AI Talent`);
    console.log(`
Hi team at ${company},

I noticed you're currently hiring for a ${jobTitle} and it looks like a fully remote position.

I run RemoteAI Jobs, a niche job board dedicated entirely to remote AI and Machine Learning professionals. We currently have a highly engaged network of 15,000+ AI researchers, ML engineers, and prompt experts looking for their next remote role.

If you're looking to reach top-tier, specialized talent rather than filtering through hundreds of unqualified applicants on general job boards, we'd love to feature your opening.

You can post the role as a "Featured Job" (pinned to the top of our homepage for maximum visibility) right here:
https://remote-ai-jobs.vercel.app/post-job

Let me know if you have any questions!

Best,
Founder, RemoteAI Jobs
    `);
    console.log("--------------------------------------------------");
    console.log("\n💡 Astuce : Cherchez l'email du recruteur sur LinkedIn ou utilisez hunter.io pour trouver un contact direct.");
    console.log("💡 Exécutez ce script pour chaque nouvelle entreprise que vous trouvez !\n");
    rl.close();
  });
});
