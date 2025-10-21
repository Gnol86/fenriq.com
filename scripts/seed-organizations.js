/* eslint-disable no-console */
const { PrismaClient } = require("@root/prisma/generated");
const crypto = require("crypto");

const prisma = new PrismaClient();

// Listes de noms fictifs pour générer des organisations réalistes
const companyTypes = [
    "Technologies",
    "Solutions",
    "Systèmes",
    "Consulting",
    "Services",
    "Innovations",
    "Digital",
    "Software",
    "Industries",
    "Group",
    "Corporation",
    "Enterprises",
    "Labs",
    "Studio",
    "Agency",
    "Partners",
    "Dynamics",
    "Networks",
    "Global",
];

const businessWords = [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Omega",
    "Prime",
    "Nova",
    "Apex",
    "Summit",
    "Vertex",
    "Matrix",
    "Nexus",
    "Quantum",
    "Stellar",
    "Cosmic",
    "Arctic",
    "Pacific",
    "Atlantic",
    "Phoenix",
    "Eagle",
    "Falcon",
    "Tiger",
    "Lion",
    "Wolf",
    "Bear",
    "Shark",
    "Dragon",
    "Thunder",
    "Lightning",
    "Storm",
    "Blaze",
    "Frost",
    "Crystal",
    "Diamond",
    "Gold",
    "Silver",
    "Platinum",
    "Iron",
    "Steel",
    "Titan",
    "Giant",
    "Mega",
    "Ultra",
    "Hyper",
    "Super",
    "Meta",
    "Cyber",
    "Tech",
    "Smart",
    "Fast",
    "Quick",
    "Swift",
    "Bright",
    "Sharp",
    "Clear",
    "Pure",
    "True",
    "Real",
    "Core",
    "Base",
    "Flow",
    "Stream",
    "Wave",
    "Pulse",
    "Beat",
    "Rhythm",
    "Sync",
    "Link",
    "Bridge",
    "Gate",
    "Path",
    "Route",
    "Way",
    "Road",
    "Track",
    "Line",
    "Point",
    "Spot",
    "Zone",
    "Area",
    "Space",
    "Place",
    "Hub",
    "Center",
    "Focus",
    "Target",
    "Goal",
    "Aim",
    "Vision",
    "Dream",
    "Hope",
];

function generateCompanyName() {
    const word1 =
        businessWords[Math.floor(Math.random() * businessWords.length)];
    const word2 = companyTypes[Math.floor(Math.random() * companyTypes.length)];
    return `${word1} ${word2}`;
}

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[àáâãäå]/g, "a")
        .replace(/[èéêë]/g, "e")
        .replace(/[ìíîï]/g, "i")
        .replace(/[òóôõö]/g, "o")
        .replace(/[ùúûü]/g, "u")
        .replace(/[çç]/g, "c")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

async function seedOrganizations() {
    console.log("🌱 Début du seed des organisations...");

    const organizations = [];
    const existingSlugs = new Set();

    // Générer 100 organisations uniques
    for (let i = 0; i < 100; i++) {
        let name, slug;

        // S'assurer que le slug est unique
        do {
            name = generateCompanyName();
            slug = generateSlug(name);
        } while (existingSlugs.has(slug));

        existingSlugs.add(slug);

        const organization = {
            id: crypto.randomBytes(12).toString("base64url"),
            name: name,
            slug: slug,
            createdAt: new Date(
                Date.now() -
                    Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
            ),
        };

        organizations.push(organization);
    }

    try {
        console.log(
            "📝 Insertion des organisations dans la base de données..."
        );

        const result = await prisma.organization.createMany({
            data: organizations,
            skipDuplicates: true,
        });

        console.log(`✅ ${result.count} organisations créées avec succès!`);

        // Afficher quelques exemples
        console.log("\n📋 Exemples d'organisations créées:");
        const examples = organizations.slice(0, 5);
        examples.forEach((org, index) => {
            console.log(`${index + 1}. ${org.name} (${org.slug})`);
        });
    } catch (error) {
        console.error("❌ Erreur lors de l'insertion:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
seedOrganizations()
    .then(() => {
        console.log("🎉 Seed terminé avec succès!");
        process.exit(0);
    })
    .catch(error => {
        console.error("💥 Erreur lors du seed:", error);
        process.exit(1);
    });
