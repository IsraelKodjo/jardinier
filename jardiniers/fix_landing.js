const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Fix encoding issues
content = content.replace(/fraǩches/g, 'fraîches');
content = content.replace(/qualitǸ/g, 'qualité');
content = content.replace(/traabilitǸ/g, 'traçabilité');
content = content.replace(/DǸcouvrez/g, 'Découvrez');
content = content.replace(/prǸcisant/g, 'précisant');
content = content.replace(/quantitǸ/g, 'quantité');
content = content.replace(/aǸroport/g, 'aéroport');
content = content.replace(/DǸclarez/g, 'Déclarez');
content = content.replace(/Contrleurs/g, 'Contrôleurs');
content = content.replace(/gǸnǸrez/g, 'générez');
content = content.replace(/rǸservǸs/g, 'réservés');
content = content.replace(/CrǸer/g, 'Créer');
content = content.replace(/gǸnǸrales/g, 'générales');
content = content.replace(/ConfidentialitǸ/g, 'Confidentialité');
content = content.replace(/LǸgal/g, 'Légal');
content = content.replace(/MarchǸ/g, 'Marché');
content = content.replace(/gǸrez/g, 'gérez');

// Fix image sizing
content = content.replace(/<div className="aspect-video bg-gray-100 relative">/g, '<div className="h-48 w-full bg-gray-100 relative overflow-hidden">');

// Replace the Commander button with a Link to /connexion
content = content.replace(
  /<button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md text-sm transition-colors shadow-sm">\s*Commander\s*<\/button>/g,
  `<Link href="/connexion" className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md text-sm transition-colors shadow-sm text-center block">\n                      Commander\n                    </Link>`
);

// Replace "Voir toutes les cultures" button with Link
content = content.replace(
  /<button className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">\s*Voir toutes les cultures\s*<\/button>/g,
  `<Link href="/connexion" className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">\n                Voir toutes les cultures\n              </Link>`
);

fs.writeFileSync('src/app/page.tsx', content);
console.log('Fixed src/app/page.tsx');
